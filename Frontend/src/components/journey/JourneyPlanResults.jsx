// components/journey/JourneyPlanResults.jsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowRight, 
  MapPin, 
  Navigation, 
  AlertTriangle,
  Route,
  Shuffle,
  Timer,
  TrendingUp,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Individual Journey Leg Component
const JourneyLeg = ({ leg, legIndex, isLast }) => {
  const { t } = useTranslation();

  const getLegIcon = (type) => {
    switch (type) {
      case 'bus':
        return <Navigation className="w-4 h-4 text-green-600" />;
      case 'walk':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'wait':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLegColor = (type) => {
    switch (type) {
      case 'bus':
        return 'border-green-200 bg-green-50';
      case 'walk':
        return 'border-blue-200 bg-blue-50';
      case 'wait':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full border-2 ${getLegColor(leg.type)}`}>
          {getLegIcon(leg.type)}
        </div>
        {!isLast && (
          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
        )}
      </div>
      
      <div className="flex-1 pb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-gray-800">
              {leg.type === 'bus' && (
                <>
                  {t('journey.takeBus')} {leg.busId || leg.busName}
                </>
              )}
              {leg.type === 'walk' && t('journey.walk')}
              {leg.type === 'wait' && t('journey.wait')}
            </h4>
            <p className="text-sm text-gray-600">
              {leg.from} → {leg.to}
            </p>
          </div>
          <div className="text-right text-sm">
            <span className="font-medium text-gray-800">{leg.duration}</span>
            {leg.distance && (
              <p className="text-gray-500">{leg.distance}</p>
            )}
          </div>
        </div>
        
        {leg.type === 'bus' && (
          <div className="text-sm text-gray-600 space-y-1">
            {leg.boardingTime && (
              <p>{t('journey.boardAt')} {leg.boardingTime}</p>
            )}
            {leg.alightTime && (
              <p>{t('journey.alightAt')} {leg.alightTime}</p>
            )}
            {leg.busStatus && (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {leg.busStatus}
              </span>
            )}
          </div>
        )}
        
        {leg.type === 'walk' && leg.instructions && (
          <div className="text-sm text-gray-600">
            <p>{leg.instructions[0] || t('journey.walkToNextStop')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Journey Option Component
const JourneyOption = ({ journey, onSelectBus, isExpanded, onToggle }) => {
  const { t } = useTranslation();

  const getTotalDuration = () => {
    return journey.totalDuration || journey.legs.reduce((total, leg) => {
      const minutes = parseInt(leg.duration) || 0;
      return total + minutes;
    }, 0);
  };

  const getTotalTransfers = () => {
    return journey.legs.filter(leg => leg.type === 'bus').length - 1;
  };

  const getTotalWalkingDistance = () => {
    return journey.legs
      .filter(leg => leg.type === 'walk')
      .reduce((total, leg) => total + (parseInt(leg.distance) || 0), 0);
  };

  const getJourneyScore = () => {
    // Simple scoring based on time and transfers
    const duration = getTotalDuration();
    const transfers = getTotalTransfers();
    const walkingDistance = getTotalWalkingDistance();
    
    let score = 100 - (duration * 0.5) - (transfers * 10) - (walkingDistance * 0.01);
    return Math.max(0, Math.min(100, score));
  };

  const handleBusSelect = (leg) => {
    if (leg.type === 'bus' && leg.busId && onSelectBus) {
      onSelectBus({
        deviceID: leg.busId,
        deviceId: leg.busId,
        name: leg.busName || `Bus ${leg.busId}`,
        status: leg.busStatus || 'Active',
        driverName: leg.driverName,
        driverPhone: leg.driverPhone
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
      {/* Journey Summary Header */}
      <div 
        className="p-4 bg-gradient-to-r from-green-50 to-blue-50 cursor-pointer hover:from-green-100 hover:to-blue-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-800">
                {t('journey.option')} {journey.optionNumber || 1}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{typeof getTotalDuration() === 'number' ? `${getTotalDuration()} min` : getTotalDuration()}</span>
            </div>
            {getTotalTransfers() > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Shuffle className="w-4 h-4" />
                <span>{getTotalTransfers()} {t('journey.transfers')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">
                {Math.round(getJourneyScore())}% {t('journey.match')}
              </div>
              <div className="text-xs text-gray-500">
                {t('journey.recommended')}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Journey Steps */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-2">
            {journey.legs.map((leg, index) => (
              <JourneyLeg
                key={index}
                leg={leg}
                legIndex={index}
                isLast={index === journey.legs.length - 1}
              />
            ))}
          </div>

          {/* Journey Statistics */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">{t('journey.summary')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-800">
                  {typeof getTotalDuration() === 'number' ? `${getTotalDuration()} min` : getTotalDuration()}
                </div>
                <div className="text-gray-600">{t('journey.totalTime')}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">{getTotalTransfers()}</div>
                <div className="text-gray-600">{t('journey.transfers')}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">
                  {getTotalWalkingDistance()}m
                </div>
                <div className="text-gray-600">{t('journey.walking')}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {Math.round(getJourneyScore())}%
                </div>
                <div className="text-gray-600">{t('journey.efficiency')}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex space-x-3">
            {journey.legs.filter(leg => leg.type === 'bus').map((leg, index) => (
              <button
                key={index}
                onClick={() => handleBusSelect(leg)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                {t('journey.trackBus')} {leg.busId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Journey Planning Results Component
const JourneyPlanResults = ({ 
  journeyResults, 
  isLoading, 
  error, 
  onBusSelect,
  searchMetadata 
}) => {
  const { t } = useTranslation();
  const [expandedJourneys, setExpandedJourneys] = useState(new Set([0])); // First journey expanded by default

  const toggleJourney = (index) => {
    const newExpanded = new Set(expandedJourneys);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedJourneys(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600">{t('journey.planning')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('journey.planningFailed')}</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!journeyResults || !journeyResults.journeys || journeyResults.journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('journey.noJourneysFound')}</h3>
        <p className="text-gray-500">{t('journey.noJourneysDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">
              {journeyResults.journeys.length} {t('journey.journeyOptions')}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {t('journey.multiLegJourney')}
          </div>
        </div>
      </div>

      {/* Direct Routes Alert (if any) */}
      {journeyResults.directRoutes && journeyResults.directRoutes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">{t('journey.directRoutesAvailable')}</span>
          </div>
          <p className="text-sm text-blue-700">
            {t('journey.directRoutesDescription')}
          </p>
        </div>
      )}

      {/* Journey Options */}
      <div className="space-y-4">
        {journeyResults.journeys.map((journey, index) => (
          <JourneyOption
            key={index}
            journey={{ ...journey, optionNumber: index + 1 }}
            onSelectBus={onBusSelect}
            isExpanded={expandedJourneys.has(index)}
            onToggle={() => toggleJourney(index)}
          />
        ))}
      </div>

      {/* Search Metadata */}
      {searchMetadata && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <h4 className="font-medium mb-2">{t('journey.searchDetails')}</h4>
          <div className="grid grid-cols-2 gap-4">
            {searchMetadata.searchTime && (
              <div>
                <span className="font-medium">{t('journey.searchTime')}</span>
                <div className="text-xs">{new Date(searchMetadata.searchTime).toLocaleTimeString()}</div>
              </div>
            )}
            {searchMetadata.totalBusesAnalyzed && (
              <div>
                <span className="font-medium">{t('journey.busesAnalyzed')}</span>
                <div className="text-xs">{searchMetadata.totalBusesAnalyzed} {t('journey.buses')}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPlanResults;