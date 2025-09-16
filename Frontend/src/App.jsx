 import './App.css'
import BusDetailsPage from './components/page/BusDetailsPage';
import Home from './components/page/Home'
import { useState } from 'react';
import { Route, Routes,BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';


function App() {

  return (
    <div className="font-sans">
      <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/bus/:deviceID' element={<BusDetailsPage />} />
      </Routes>
      </BrowserRouter>
      
      
    </div>
  );
}

export default App
