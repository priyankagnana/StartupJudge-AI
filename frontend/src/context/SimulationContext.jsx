import { createContext, useContext, useState, useCallback } from 'react';
import { listSimulations as fetchList, deleteSimulation as fetchDelete } from '../services/api';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [simulations, setSimulations] = useState([]);
  const [currentSimulationId, setCurrentSimulationId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchSimulations = useCallback(async () => {
    try {
      const data = await fetchList();
      setSimulations(data.simulations || []);
      setLoaded(true);
    } catch {
      setSimulations([]);
      setLoaded(true);
    }
  }, []);

  const removeSimulation = useCallback(async (id) => {
    try {
      await fetchDelete(id);
      setSimulations(prev => prev.filter(s => s._id !== id));
    } catch {}
  }, []);

  const addSimulationToList = useCallback((sim) => {
    setSimulations(prev => [sim, ...prev]);
  }, []);

  const updateSimulationInList = useCallback((id, updates) => {
    setSimulations(prev => prev.map(s => s._id === id ? { ...s, ...updates } : s));
  }, []);

  return (
    <SimulationContext.Provider value={{
      simulations, loaded, currentSimulationId, isReadOnly,
      fetchSimulations, removeSimulation, addSimulationToList, updateSimulationInList,
      setCurrentSimulationId, setIsReadOnly,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulations = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulations must be used within SimulationProvider');
  return ctx;
};
