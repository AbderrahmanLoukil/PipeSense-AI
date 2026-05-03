import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FarmDashboard } from './components/FarmDashboard';
import { ClimateAndSensors } from './components/ClimateAndSensors';
import { AIRecommendation } from './components/AIRecommendation';
import { ActionEngine } from './components/ActionEngine';
import { ConfirmationReport } from './components/ConfirmationReport';
import { fallbackFarmState } from './data/fallbackFarmState';
import {
  adjustFieldSensor,
  getFarmState,
  getOperations,
  overrideValve,
  recalculateRecommendations,
  resetExecution,
  runFieldDiagnostic,
  runSimulation,
  startExecution,
  testValve,
  withLocalSimulation,
} from './lib/farmApi';
import type {
  FarmState,
  FieldDiagnosticResult,
  OperationEvent,
  SensorAdjustment,
  SimulationScenario,
  ValveOverrideResult,
  ValveTestResult,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [farmState, setFarmState] = useState<FarmState>(fallbackFarmState);
  const [apiOnline, setApiOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getFarmState()
      .then(data => {
        if (!cancelled) {
          setFarmState(data);
          setApiOnline(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiOnline(false);
          setFarmState(fallbackFarmState);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!farmState.execution.started || farmState.execution.status === 'completed') {
      return;
    }

    const interval = window.setInterval(() => {
      if (apiOnline) {
        getFarmState()
          .then(data => {
            setFarmState(data);
            setApiOnline(true);
          })
          .catch(() => setApiOnline(false));
        return;
      }

      setFarmState(previous => {
        const nextProgress = Math.min(previous.execution.progress + 10, 100);

        return {
          ...previous,
          execution: {
            ...previous.execution,
            progress: nextProgress,
            status: nextProgress >= 100 ? 'completed' : 'running',
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [apiOnline, farmState.execution.started, farmState.execution.status]);

  const handleGeneratePlan = () => {
    setCurrentView('recommendation');
  };

  const handleSimulation = async (scenario: SimulationScenario) => {
    if (!apiOnline) {
      setFarmState(previous => withLocalSimulation(previous, scenario));
      return;
    }

    try {
      setFarmState(await runSimulation(scenario));
    } catch {
      setApiOnline(false);
      setFarmState(previous => withLocalSimulation(previous, scenario));
    }
  };

  const handleExecutePlan = async () => {
    if (!apiOnline) {
      setFarmState(previous => ({
        ...previous,
        execution: {
          started: true,
          progress: 0,
          status: 'running',
          log: [
            { time: '06:00:00.000', event: 'AI irrigation plan loaded into controller', status: 'info' },
            { time: '06:00:01.234', event: 'Field A: valve opening command sent', status: 'success' },
            { time: '06:00:02.345', event: 'Field C: blocked - pressure below safe threshold', status: 'error' },
          ],
        },
      }));
      return;
    }

    try {
      setFarmState(await startExecution());
    } catch {
      setApiOnline(false);
    }
  };

  const handleResetExecution = async () => {
    if (!apiOnline) {
      setFarmState(previous => ({
        ...previous,
        execution: {
          started: false,
          progress: 0,
          status: 'idle',
          log: [],
        },
      }));
      return;
    }

    try {
      setFarmState(await resetExecution());
    } catch {
      setApiOnline(false);
    }
  };

  const handleSensorAdjustment = async (fieldId: string, adjustment: SensorAdjustment) => {
    if (!apiOnline) {
      setFarmState(previous => ({
        ...previous,
        fields: previous.fields.map(field =>
          field.id === fieldId
            ? {
                ...field,
                sensor: {
                  ...field.sensor,
                  soilMoisture: Math.min(Math.max(field.sensor.soilMoisture + (adjustment.soilMoistureDelta ?? 0), 0), 60),
                  pressure: Number((field.sensor.pressure + (adjustment.pressureDelta ?? 0)).toFixed(1)),
                  rainProbability: Math.min(Math.max(field.sensor.rainProbability + (adjustment.rainProbabilityDelta ?? 0), 0), 100),
                },
              }
            : field,
        ),
      }));
      return;
    }

    try {
      setFarmState(await adjustFieldSensor(fieldId, adjustment));
    } catch {
      setApiOnline(false);
    }
  };

  const handleRecalculate = async () => {
    if (!apiOnline) {
      return;
    }

    try {
      setFarmState(await recalculateRecommendations());
    } catch {
      setApiOnline(false);
    }
  };

  const handleFieldDiagnostic = async (fieldId: string): Promise<FieldDiagnosticResult | null> => {
    if (!apiOnline) {
      return null;
    }

    try {
      return await runFieldDiagnostic(fieldId);
    } catch {
      setApiOnline(false);
      return null;
    }
  };

  const handleValveTest = async (fieldId: string): Promise<ValveTestResult | null> => {
    try {
      const result = await testValve(fieldId);
      setApiOnline(true);
      if (result?.state) {
        setFarmState(result.state);
      }
      return result;
    } catch {
      setApiOnline(false);
      return null;
    }
  };

  const handleValveOverride = async (fieldId: string, action: 'open' | 'close'): Promise<ValveOverrideResult | null> => {
    try {
      const result = await overrideValve(fieldId, action);
      setApiOnline(true);
      setFarmState(result.state);
      return result;
    } catch {
      setApiOnline(false);
      return null;
    }
  };

  const handleLoadOperations = async (): Promise<OperationEvent[]> => {
    try {
      const events = await getOperations();
      setApiOnline(true);
      return events;
    } catch {
      setApiOnline(false);
      return [];
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <FarmDashboard fields={farmState.fields} onGeneratePlan={handleGeneratePlan} />;
      case 'climate':
        return (
          <ClimateAndSensors
            fields={farmState.fields}
            onSimulate={handleSimulation}
            onAdjustSensor={handleSensorAdjustment}
            onRecalculate={handleRecalculate}
            onRunDiagnostic={handleFieldDiagnostic}
          />
        );
      case 'recommendation':
        return <AIRecommendation fields={farmState.fields} />;
      case 'action':
        return (
          <ActionEngine
            fields={farmState.fields}
            execution={farmState.execution}
            onExecute={handleExecutePlan}
            onReset={handleResetExecution}
            onValveTest={handleValveTest}
            onValveOverride={handleValveOverride}
            onLoadOperations={handleLoadOperations}
          />
        );
      case 'report':
        return <ConfirmationReport fields={farmState.fields} execution={farmState.execution} />;
      default:
        return <FarmDashboard fields={farmState.fields} onGeneratePlan={handleGeneratePlan} />;
    }
  };

  return (
    <div className="size-full flex bg-slate-50 text-slate-950">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header farm={farmState.farm} apiOnline={apiOnline} isLoading={isLoading} />
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
