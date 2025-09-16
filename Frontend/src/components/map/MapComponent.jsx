import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  MapPin, 
  Clock, 
  User, 
  Navigation, 
  ChevronLeft, 
  Zap, 
  Route, 
  AlertCircle 
} from 'lucide-react';



const routes = [
  { from: 'Kolkata Station', to: 'Barrackpore', buses: ['BUS001'] },
  { from: 'Esplanade', to: 'Sealdah', buses: ['BUS002'] },
  { from: 'Park Street', to: 'Dumdum', buses: ['BUS001', 'BUS002'] }
];

// Simple Map Component (using SVG for demonstration)
const MapComponent = ({ route, currentLocation, busId }) => {
  const mapRef = useRef(null);
  const [animatedPosition, setAnimatedPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPosition(prev => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden border-2 border-green-100">
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Route line */}
        {route && route.length > 1 && (
          <polyline
            points={route.map((point, i) => `${50 + i * 80},${100 + Math.sin(i) * 30}`).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray="5,5"
          />
        )}
        
        {/* Route points */}
        {route && route.map((point, index) => (
          <g key={index}>
            <circle
              cx={50 + index * 80}
              cy={100 + Math.sin(index) * 30}
              r="6"
              fill={index === 0 ? "#ef4444" : index === route.length - 1 ? "#10b981" : "#3b82f6"}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={50 + index * 80}
              y={85 + Math.sin(index) * 30}
              textAnchor="middle"
              className="text-xs fill-gray-700 font-medium"
            >
              {point.name}
            </text>
          </g>
        ))}
        
        {/* Animated bus */}
        {route && route.length > 1 && (
          <g>
            <circle
              cx={50 + (animatedPosition / 100) * (route.length - 1) * 80}
              cy={100 + Math.sin((animatedPosition / 100) * (route.length - 1)) * 30}
              r="8"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <text
              x={50 + (animatedPosition / 100) * (route.length - 1) * 80}
              y={105 + Math.sin((animatedPosition / 100) * (route.length - 1)) * 30}
              textAnchor="middle"
              className="text-xs fill-white font-bold"
            >
              🚌
            </text>
          </g>
        )}
      </svg>
      
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium text-gray-700">
        Live Tracking
      </div>
    </div>
  );
};

export default MapComponent