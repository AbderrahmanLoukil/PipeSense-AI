
  # High-Fidelity Prototype for PipeSense AI

  This is a code bundle for High-Fidelity Prototype for PipeSense AI. The original project is available at https://www.figma.com/design/fyjAURZ4nS00A9rEfsljFK/High-Fidelity-Prototype-for-PipeSense-AI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run backend` to start the local API on port 8787.

  Run `npm run dev` in another terminal to start the development server.

  The app includes local fallback data, so the prototype still opens if the API is not running.

  Useful API routes:

  - `GET /api/farm`
  - `POST /api/simulations`
  - `POST /api/execution/start`
  - `POST /api/execution/reset`
  - `POST /api/recommendations/recalculate`
  - `POST /api/fields/:fieldId/sensor`
  - `POST /api/fields/:fieldId/diagnostic`
  - `POST /api/valves/:fieldId/test`
  - `POST /api/valves/:fieldId/override`
  - `GET /api/operations`
  - `GET /api/health`
  - `POST /api/report/export`
  - `POST /api/notifications/farmer`
  - `GET /api/plans/next`
  
