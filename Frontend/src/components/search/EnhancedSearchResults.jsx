// components/search/EnhancedSearchResults.jsx
import React, { useState } from 'react';
import {  
  Route, 
  Navigation, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Shuffle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BusSearchResults from '../shared/BusSearchResults';
import JourneyPlanResults from '../journey/JourneyPlanResults';

const EnhancedSearchResults = ({
  enhancedResults,
  isLoading,
  searchType,
  onBusSelect,
  error
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'journey'

  // Don't render if no enhanced results
  if (!enhancedResults) {
    return null;
  }

  const {
    busResults,
    journeyResults,
    hasResults,
    suggestions
  } = enhancedResults;

  const hasDirectBuses = busResults?.searchResults?.length > 0;
  const hasJourneyOptions = journeyResults?.journeyResults?.journeys?.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-gray-600">
          {searchType === 'route' ? t('enhanced.searchingRoutes') : t('enhanced.searchingBuses')}
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('enhanced.searchError')}</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {t('enhanced.tryAgain')}
        </button>
      </div>
    );
  }

  // No results at all
  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{t('enhanced.noRoutesFound')}</h3>
        <p className="text-gray-500 mb-6">{t('enhanced.noRoutesDescription')}</p>
        
        {/* Search Suggestions */}
        {suggestions && suggestions.tips.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">{t('enhanced.searchTips')}</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {suggestions.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Results available - show tabbed interface if both types exist
  const shouldShowTabs = hasDirectBuses && hasJourneyOptions;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('enhanced.searchResults')}</h2>
          <div className="text-sm text-gray-600">
            {hasDirectBuses && hasJourneyOptions ? t('enhanced.directAndJourney') :
             hasDirectBuses ? t('enhanced.directOnly') : t('enhanced.journeyOnly')}
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          {hasDirectBuses && (
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">
                {busResults.searchResults.length} {t('enhanced.directBuses')}
              </span>
            </div>
          )}
          {hasJourneyOptions && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">
                {journeyResults.journeyResults.journeys.length} {t('enhanced.journeyOptions')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Priority Alert for Journey Planning */}
      {!hasDirectBuses && hasJourneyOptions && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shuffle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">{t('enhanced.noDirectRoutes')}</h3>
              <p className="text-sm text-amber-700">
                {t('enhanced.noDirectRoutesDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation for Best Options */}
      {hasDirectBuses && hasJourneyOptions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 mb-1">{t('enhanced.multipleOptions')}</h3>
              <p className="text-sm text-green-700">
                {t('enhanced.multipleOptionsDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Interface or Single View */}
      {shouldShowTabs ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-100">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('direct')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'direct'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4" />
                  <span>{t('enhanced.directRoutes')} ({busResults.searchResults.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('journey')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'journey'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Route className="w-4 h-4" />
                  <span>{t('enhanced.journeyPlanning')} ({journeyResults.journeyResults.journeys.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'direct' && (
              <BusSearchResults
                searchResults={busResults.searchResults}
                isLoading={busResults.isLoading}
                searchType={busResults.searchType}
                searchMetadata={busResults.searchMetadata}
                onBusSelect={onBusSelect}
                error={busResults.error}
              />
            )}
            {activeTab === 'journey' && (
              <JourneyPlanResults
                journeyResults={journeyResults.journeyResults}
                isLoading={journeyResults.isLoading}
                error={journeyResults.error}
                onBusSelect={onBusSelect}
                searchMetadata={journeyResults.searchMetadata}
              />
            )}
          </div>
        </div>
      ) : (
        // Single view - show whichever is available
        <div>
          {hasDirectBuses && (
            <BusSearchResults
              searchResults={busResults.searchResults}
              isLoading={busResults.isLoading}
              searchType={busResults.searchType}
              searchMetadata={busResults.searchMetadata}
              onBusSelect={onBusSelect}
              error={busResults.error}
            />
          )}
          {hasJourneyOptions && (
            <JourneyPlanResults
              journeyResults={journeyResults.journeyResults}
              isLoading={journeyResults.isLoading}
              error={journeyResults.error}
              onBusSelect={onBusSelect}
              searchMetadata={journeyResults.searchMetadata}
            />
          )}
        </div>
      )}

      {/* Search Suggestions Footer */}
      {suggestions && (suggestions.alternatives.length > 0 || suggestions.improvements.length > 0) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">{t('enhanced.suggestions')}</h4>
          
          {suggestions.alternatives.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">{t('enhanced.alternatives')}</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestions.alternatives.map((alt, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.improvements.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">{t('enhanced.improvements')}</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestions.improvements.map((imp, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <Clock className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchResults;