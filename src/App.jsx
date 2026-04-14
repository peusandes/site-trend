import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import EventPage from './pages/EventPage';
import GlobalRanking from './pages/GlobalRanking';
import Statistics from './pages/Statistics';
import Sparkle from './components/Sparkle';
import ParticleField from './components/ParticleField';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [activeEvent, setActiveEvent] = useState(null);

  const navigate = useCallback((page) => {
    setActiveEvent(null);
    setActivePage(page);
  }, []);

  const openEvent = useCallback((key) => {
    setActiveEvent(key);
    setActivePage('event');
  }, []);

  function renderPage() {
    if (activeEvent && activePage === 'event') {
      return (
        <EventPage
          key={activeEvent}
          eventoKey={activeEvent}
          onBack={() => navigate('overview')}
        />
      );
    }
    switch (activePage) {
      case 'ranking':    return <GlobalRanking key="ranking" />;
      case 'statistics': return <Statistics key="statistics" />;
      default:           return <Overview key="overview" onEventClick={openEvent} />;
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ParticleField />

      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        activeEvent={activeEvent}
        onEventClick={openEvent}
      />

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* Accent sparkles */}
        <Sparkle size={60} color="rgba(218,111,216,0.04)"
          style={{ position: 'fixed', top: 40, right: 80, pointerEvents: 'none', zIndex: 0 }} />
        <Sparkle size={30} color="rgba(218,111,216,0.06)"
          style={{ position: 'fixed', bottom: 120, right: 220, pointerEvents: 'none', zIndex: 0 }} />
        <Sparkle size={20} color="rgba(218,111,216,0.05)"
          style={{ position: 'fixed', top: 200, right: 400, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, minHeight: '100%' }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
