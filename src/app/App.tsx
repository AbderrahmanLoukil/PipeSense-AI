import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FarmDashboard } from './components/FarmDashboard';
import { ClimateAndSensors } from './components/ClimateAndSensors';
import { AIRecommendation } from './components/AIRecommendation';
import { ActionEngine } from './components/ActionEngine';
import { ConfirmationReport } from './components/ConfirmationReport';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [planExecuted, setPlanExecuted] = useState(false);

  const handleGeneratePlan = () => {
    setCurrentView('recommendation');
  };

  const handleExecutePlan = () => {
    setPlanExecuted(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <FarmDashboard onGeneratePlan={handleGeneratePlan} />;
      case 'climate':
        return <ClimateAndSensors />;
      case 'recommendation':
        return <AIRecommendation />;
      case 'action':
        return <ActionEngine executed={planExecuted} onExecute={handleExecutePlan} />;
      case 'report':
        return <ConfirmationReport />;
      default:
        return <FarmDashboard onGeneratePlan={handleGeneratePlan} />;
    }
  };

  return (
    <div className="size-full flex bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </div>
    </div>
  );
}