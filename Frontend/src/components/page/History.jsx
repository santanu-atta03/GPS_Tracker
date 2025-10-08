import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, MapPin, Route, Clock, Trash2 } from "lucide-react";
import { setpath } from "@/Redux/auth.reducer";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { clearHistory } from "@/Redux/history.reducer";

const History = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((store) => store.history);
  const { darktheme } = useSelector((store) => store.auth);

  const handelClick = (index) => {
    dispatch(setpath(items[index]));
    navigate("/fllow/path");
  };
  
  const handelRefresh = () => {
    dispatch(clearHistory([]));
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className={`min-h-screen ${
          darktheme 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-green-50 via-white to-green-100'
        }`}>
          <div className="flex flex-col justify-center items-center min-h-[80vh]">
            <div className={`rounded-2xl shadow-xl p-12 text-center border ${
              darktheme 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                darktheme ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Clock className={`w-10 h-10 ${darktheme ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                No History Yet
              </h2>
              <p className={`mb-6 ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                You haven't searched any routes yet.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${
        darktheme 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-green-50 via-white to-green-100'
      }`}>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <h1 className={`text-4xl font-bold mb-4 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
              Route History
            </h1>
            <p className={`text-lg ${darktheme ? 'text-gray-300' : 'text-gray-600'}`}>
              View and access your previously searched routes
            </p>
            
            {/* Clear History Button */}
            <button
              onClick={handelRefresh}
              className="absolute top-0 right-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>

          {/* History Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const from = item.pathAddresses?.[0]?.address || "Unknown";
              const to =
                item.pathAddresses?.[item.pathAddresses.length - 1]?.address ||
                "Unknown";

              return (
                <div
                  key={index}
                  className={`shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    darktheme 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-green-100'
                  }`}
                  onClick={() => handelClick(index)}
                >
                  {/* Header with Route Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darktheme ? 'bg-green-900' : 'bg-green-100'
                      }`}>
                        <Route className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                        Route #{index + 1}
                      </h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${
                      darktheme ? 'bg-green-900' : 'bg-green-50'
                    }`}>
                      <span className={`text-xs font-medium capitalize ${
                        darktheme ? 'text-green-400' : 'text-green-700'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className={`rounded-xl p-4 mb-4 ${
                    darktheme ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className={`text-xs mb-1 ${darktheme ? 'text-gray-400' : 'text-gray-500'}`}>
                            From
                          </p>
                          <p className={`text-sm font-semibold line-clamp-2 ${
                            darktheme ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {from}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowRight className={`w-5 h-5 ${darktheme ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className={`text-xs mb-1 ${darktheme ? 'text-gray-400' : 'text-gray-500'}`}>
                            To
                          </p>
                          <p className={`text-sm font-semibold line-clamp-2 ${
                            darktheme ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {to}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View Route Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handelClick(index);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    View Route
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default History;