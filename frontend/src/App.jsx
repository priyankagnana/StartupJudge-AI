import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import SimulationView from './pages/SimulationView';
import Dashboard from './pages/Dashboard';

function App() {
  const [simulationData, setSimulationData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulate" element={<SimulationView setSimulationData={setSimulationData} />} />
        <Route path="/dashboard" element={<Dashboard data={simulationData} />} />
      </Routes>
    </Router>
  );
}

export default App;
