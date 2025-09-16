 import './App.css'
import BusDetailsPage from './components/page/BusDetailsPage';
import Home from './components/page/Home'
import { useState } from 'react';

function App() {
 const [currentView, setCurrentView] = useState('home');
  const [selectedBus, setSelectedBus] = useState(null);

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
    setCurrentView('busDetails');
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedBus(null);
  };

  return (
    <div className="font-sans">
      {currentView === 'home' ? (
        <Home onBusSelect={handleBusSelect} />
      ) : (
        <BusDetailsPage bus={selectedBus} onBack={handleBack} />
      )}
    </div>
  );
}

export default App
