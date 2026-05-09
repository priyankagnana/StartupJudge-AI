import { useState, useEffect } from 'react';
import { SimulationProvider } from '../context/SimulationContext';
import HistorySidebar from '../components/HistorySidebar';
import SimulationView from './SimulationView';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

const SimulationPage = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <SimulationProvider>
      <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <HistorySidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SimulationView onToggleSidebar={() => setSidebarOpen(s => !s)} />
        </div>
      </div>
    </SimulationProvider>
  );
};

export default SimulationPage;
