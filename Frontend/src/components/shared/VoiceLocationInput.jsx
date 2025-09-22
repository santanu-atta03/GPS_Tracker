import React, { useState } from 'react';
import useSpeechToText from '../../hooks/useSpeechToText';
import { geocodeAddress } from '../../services/geocode';
import { Mic } from 'lucide-react'; // Optional icon

const VoiceLocationInput = ({ label, onLocationSet }) => {
  const [address, setAddress] = useState('');
  const { listening, startListening } = useSpeechToText();

  const handleMicClick = () => {
    startListening(async (spokenText) => {
      setAddress(spokenText); // Show in input
      const geoData = await geocodeAddress(spokenText);
      if (geoData) {
        onLocationSet(geoData); // Send back to parent
      } else {
        alert("Couldn't find the location. Please try again.");
      }
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Type or use mic..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleMicClick}
          type="button"
          className={`p-3 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition ${
            listening ? 'animate-pulse bg-green-200' : ''
          }`}
          title="Speak now"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>
      {listening && <p className="text-xs text-green-600 mt-1">Listening...</p>}
    </div>
  );
};

export default VoiceLocationInput;
