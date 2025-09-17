import React, { useState } from 'react';

const BusSearchDebug = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testCoords, setTestCoords] = useState({
    lat: 22.5726, // Kolkata latitude as example
    lng: 88.3639, // Kolkata longitude
    radius: 10000
  });
  const [routeCoords, setRouteCoords] = useState({
    fromLat: 22.5726,
    fromLng: 88.3639,
    toLat: 22.6068,
    toLng: 88.4331,
    radius: 10000
  });

  // Mock API connector for testing
  const mockApiConnector = async (method, url) => {
    console.log(`Mock API Call: ${method} ${url}`);
    
    // Mock response based on URL pattern
    if (url.includes('/get/search')) {
      return {
        data: {
          success: true,
          buses: [
            {
              deviceID: "BUS001",
              location: {
                type: "Point",
                coordinates: [88.3639, 22.5726] // [lng, lat]
              },
              route: [
                {
                  type: "Point",
                  coordinates: [88.3500, 22.5700],
                  timestamp: new Date()
                },
                {
                  type: "Point",
                  coordinates: [88.3639, 22.5726],
                  timestamp: new Date()
                }
              ],
              distanceFromSearch: 150,
              driverName: "John Doe",
              status: "Active"
            },
            {
              deviceID: "BUS002", 
              location: {
                type: "Point",
                coordinates: [88.4000, 22.6000]
              },
              route: [],
              distanceFromSearch: 2500,
              driverName: "Jane Smith",
              status: "Active"
            }
          ],
          metadata: {
            searchLocation: { latitude: 22.5726, longitude: 88.3639 },
            radius: 10000,
            totalFound: 2
          }
        }
      };
    } else if (url.includes('/route/search')) {
      return {
        data: {
          success: true,
          buses: [
            {
              deviceID: "ROUTE_BUS001",
              location: {
                type: "Point", 
                coordinates: [88.3700, 22.5800]
              },
              route: [
                {
                  type: "Point",
                  coordinates: [88.3639, 22.5726], // Near start
                  timestamp: new Date()
                },
                {
                  type: "Point",
                  coordinates: [88.4000, 22.5900],
                  timestamp: new Date()
                },
                {
                  type: "Point", 
                  coordinates: [88.4331, 22.6068], // Near end
                  timestamp: new Date()
                }
              ],
              routeAnalysis: {
                score: 0.8,
                passesThrough: true,
                isCorrectDirection: true,
                fromDistance: 100,
                toDistance: 200
              },
              distanceFromStart: 100,
              distanceFromEnd: 200,
              driverName: "Route Driver",
              status: "Active"
            }
          ],
          metadata: {
            fromLocation: { lat: 22.5726, lng: 88.3639 },
            toLocation: { lat: 22.6068, lng: 88.4331 },
            radius: 10000,
            routeBusesCount: 1
          }
        }
      };
    }
    
    return { data: { success: false, message: "Unknown endpoint" } };
  };

  const validateCoordinates = (lat, lng) => {
    const issues = [];
    
    if (!lat || !lng) {
      issues.push("Missing coordinates");
    }
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      issues.push(`Invalid types: lat=${typeof lat}, lng=${typeof lng}`);
    }
    if (isNaN(lat) || isNaN(lng)) {
      issues.push("Coordinates are NaN");
    }
    if (lat < -90 || lat > 90) {
      issues.push(`Latitude ${lat} out of range [-90, 90]`);
    }
    if (lng < -180 || lng > 180) {
      issues.push(`Longitude ${lng} out of range [-180, 180]`);
    }
    
    return issues;
  };

  const testNearbySearch = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const lat = parseFloat(testCoords.lat);
      const lng = parseFloat(testCoords.lng);
      const radius = parseInt(testCoords.radius);
      
      console.log("Testing nearby search with:", { lat, lng, radius });
      
      // Validate coordinates
      const validationIssues = validateCoordinates(lat, lng);
      if (validationIssues.length > 0) {
        setResults({
          type: 'error',
          message: 'Coordinate validation failed',
          issues: validationIssues
        });
        return;
      }
      
      // Test API call
      const url = `/get/search?lat=${lat}&lng=${lng}&radius=${radius}`;
      const response = await mockApiConnector("GET", url);
      
      setResults({
        type: 'success',
        searchType: 'nearby',
        url,
        response: response.data,
        validatedCoords: { lat, lng, radius }
      });
      
    } catch (error) {
      setResults({
        type: 'error',
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testRouteSearch = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const fromLat = parseFloat(routeCoords.fromLat);
      const fromLng = parseFloat(routeCoords.fromLng);
      const toLat = parseFloat(routeCoords.toLat);
      const toLng = parseFloat(routeCoords.toLng);
      const radius = parseInt(routeCoords.radius);
      
      console.log("Testing route search with:", { fromLat, fromLng, toLat, toLng, radius });
      
      // Validate all coordinates
      const fromIssues = validateCoordinates(fromLat, fromLng);
      const toIssues = validateCoordinates(toLat, toLng);
      
      if (fromIssues.length > 0 || toIssues.length > 0) {
        setResults({
          type: 'error',
          message: 'Route coordinate validation failed',
          fromIssues,
          toIssues
        });
        return;
      }
      
      // Test API call
      const url = `/route/search?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}&radius=${radius}`;
      const response = await mockApiConnector("GET", url);
      
      setResults({
        type: 'success',
        searchType: 'route',
        url,
        response: response.data,
        validatedCoords: { fromLat, fromLng, toLat, toLng, radius }
      });
      
    } catch (error) {
      setResults({
        type: 'error', 
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testCoordinateFormats = () => {
    const testCases = [
      { name: "GeoJSON [lng, lat]", coords: [88.3639, 22.5726] },
      { name: "Standard [lat, lng]", coords: [22.5726, 88.3639] },
      { name: "Object {lat, lng}", coords: { lat: 22.5726, lng: 88.3639 } },
      { name: "Object {latitude, longitude}", coords: { latitude: 22.5726, longitude: 88.3639 } }
    ];
    
    setResults({
      type: 'coordinate_test',
      testCases: testCases.map(test => ({
        ...test,
        isValidGeoJSON: Array.isArray(test.coords) && test.coords[0] >= -180 && test.coords[0] <= 180 && test.coords[1] >= -90 && test.coords[1] <= 90,
        extractedLat: Array.isArray(test.coords) ? test.coords[1] : (test.coords.lat || test.coords.latitude),
        extractedLng: Array.isArray(test.coords) ? test.coords[0] : (test.coords.lng || test.coords.longitude)
      }))
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bus Search Debug Tool</h1>
      
      {/* Nearby Search Test */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">Test Nearby Search</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={testCoords.lat}
              onChange={(e) => setTestCoords({...testCoords, lat: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22.5726"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={testCoords.lng}
              onChange={(e) => setTestCoords({...testCoords, lng: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="88.3639"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (m)</label>
            <input
              type="number"
              value={testCoords.radius}
              onChange={(e) => setTestCoords({...testCoords, radius: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
          </div>
        </div>
        <button
          onClick={testNearbySearch}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Nearby Search'}
        </button>
      </div>

      {/* Route Search Test */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-green-600">Test Route Search</h2>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Lat</label>
            <input
              type="number"
              step="any"
              value={routeCoords.fromLat}
              onChange={(e) => setRouteCoords({...routeCoords, fromLat: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Lng</label>
            <input
              type="number"
              step="any"
              value={routeCoords.fromLng}
              onChange={(e) => setRouteCoords({...routeCoords, fromLng: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Lat</label>
            <input
              type="number"
              step="any"
              value={routeCoords.toLat}
              onChange={(e) => setRouteCoords({...routeCoords, toLat: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Lng</label>
            <input
              type="number"
              step="any"
              value={routeCoords.toLng}
              onChange={(e) => setRouteCoords({...routeCoords, toLng: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (m)</label>
            <input
              type="number"
              value={routeCoords.radius}
              onChange={(e) => setRouteCoords({...routeCoords, radius: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <button
          onClick={testRouteSearch}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Route Search'}
        </button>
      </div>

      {/* Coordinate Format Test */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-purple-600">Test Coordinate Formats</h2>
        <button
          onClick={testCoordinateFormats}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Coordinate Formats
        </button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          
          {results.type === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Error:</h3>
              <p>{results.message}</p>
              {results.issues && (
                <ul className="mt-2 list-disc list-inside">
                  {results.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
              {results.fromIssues && results.fromIssues.length > 0 && (
                <div className="mt-2">
                  <strong>From coordinate issues:</strong>
                  <ul className="list-disc list-inside">
                    {results.fromIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.toIssues && results.toIssues.length > 0 && (
                <div className="mt-2">
                  <strong>To coordinate issues:</strong>
                  <ul className="list-disc list-inside">
                    {results.toIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {results.type === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Success - {results.searchType} search</h3>
              <p><strong>URL:</strong> {results.url}</p>
              <p><strong>Buses found:</strong> {results.response.buses?.length || 0}</p>
              <p><strong>API Success:</strong> {results.response.success ? 'Yes' : 'No'}</p>
            </div>
          )}

          {results.type === 'coordinate_test' && (
            <div className="space-y-4">
              {results.testCases.map((test, idx) => (
                <div key={idx} className={`p-3 rounded border ${test.isValidGeoJSON ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h4 className="font-semibold">{test.name}</h4>
                  <p><strong>Original:</strong> {JSON.stringify(test.coords)}</p>
                  <p><strong>Extracted Lat:</strong> {test.extractedLat}</p>
                  <p><strong>Extracted Lng:</strong> {test.extractedLng}</p>
                  <p><strong>Valid GeoJSON:</strong> {test.isValidGeoJSON ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Raw Response:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {/* Common Issues Checklist */}
      <div className="mt-8 p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4 text-yellow-800">Common Issues Checklist:</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Wrong API endpoint:</strong> Make sure you're calling <code>/route/search</code> for route searches, not <code>/get/search</code></span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Coordinate format:</strong> MongoDB expects [longitude, latitude] but you might be sending [latitude, longitude]</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            {/* <span><strong>Missing geospatial index:</strong> Run <code>{db.locations.createIndex({"location": "2dsphere"})}</code> in MongoDB</span> */}
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Empty database:</strong> Make sure there are buses in your database with valid coordinates</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Search radius too small:</strong> Try increasing the radius to 10km (10000m) or more for testing</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Invalid coordinates:</strong> Check that latitude is between -90 and 90, longitude between -180 and 180</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>CORS issues:</strong> Make sure your backend allows requests from your frontend domain</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span><strong>Environment variables:</strong> Check that VITE_BASE_URL is correctly set</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BusSearchDebug;