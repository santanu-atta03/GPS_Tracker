import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Loader2,
  Ticket,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const MyTickets = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/Bus/user/all-ticket`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTickets(res.data.allTicket || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTickets();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (loading) {
    return (
      <div className={`min-h-screen ${
        darktheme 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-green-50 via-white to-green-100'
      }`}>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <div className={`rounded-2xl shadow-xl p-8 flex flex-col items-center border ${
            darktheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-green-100'
          }`}>
            <Loader2 className="animate-spin w-12 h-12 text-green-500 mb-4" />
            <span className={`text-lg font-medium ${darktheme ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading your tickets...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className={`min-h-screen ${
        darktheme 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-green-50 via-white to-green-100'
      }`}>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <div className={`rounded-2xl shadow-xl p-12 text-center border ${
            darktheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darktheme ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Ticket className={`w-10 h-10 ${darktheme ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
              No Tickets Yet
            </h2>
            <p className={`mb-6 ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
              You haven't booked any tickets yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Book Your First Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darktheme 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-white to-green-100'
    }`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
            My Tickets
          </h1>
          <p className={`text-lg ${darktheme ? 'text-gray-300' : 'text-gray-600'}`}>
            View and manage all your bus tickets
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                darktheme 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-green-100'
              }`}
              onClick={() => navigate(`/ticket/${ticket._id}`)}
            >
              {/* Header with Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darktheme ? 'bg-green-900' : 'bg-green-100'
                  }`}>
                    <Ticket className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                    {ticket.busId || "Bus Info"}
                  </h2>
                </div>
                {ticket.paymentStatus === "Success" ? (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    darktheme ? 'bg-green-900' : 'bg-green-50'
                  }`}>
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                    <span className={`text-xs font-medium ${
                      darktheme ? 'text-green-400' : 'text-green-700'
                    }`}>
                      Confirmed
                    </span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    darktheme ? 'bg-red-900' : 'bg-red-50'
                  }`}>
                    <XCircle className="text-red-500 w-4 h-4" />
                    <span className={`text-xs font-medium ${
                      darktheme ? 'text-red-400' : 'text-red-700'
                    }`}>
                      Failed
                    </span>
                  </div>
                )}
              </div>

              {/* Route Information */}
              <div className={`rounded-xl p-4 mb-4 ${
                darktheme ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className={`text-sm ${darktheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">
                      Stop {ticket.fromIndex}
                    </span>
                    <span className={`mx-2 ${darktheme ? 'text-gray-500' : 'text-gray-400'}`}>→</span>
                    <span className="font-semibold">Stop {ticket.toIndex}</span>
                  </p>
                </div>
                <p className={`text-sm ml-6 ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Distance:{" "}
                  <span className="font-medium">
                    {ticket.passengerDistance} km
                  </span>
                </p>
              </div>

              {/* Price */}
              <div className={`flex items-center justify-between rounded-xl p-4 mb-4 ${
                darktheme ? 'bg-green-900' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  <span className={`text-sm ${darktheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total Fare
                  </span>
                </div>
                <span className={`text-xl font-bold ${
                  darktheme ? 'text-green-400' : 'text-green-700'
                }`}>
                  ₹{ticket.ticketPrice}
                </span>
              </div>

              {/* Date and Status */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-sm ${
                  darktheme ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Calendar className={`w-4 h-4 ${darktheme ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span>
                    {new Date(ticket.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={darktheme ? 'text-gray-400' : 'text-gray-600'}>
                    Payment Status:
                  </span>
                  <span
                    className={`font-semibold ${
                      ticket.paymentStatus === "Success"
                        ? darktheme ? "text-green-400" : "text-green-600"
                        : darktheme ? "text-red-400" : "text-red-500"
                    }`}
                  >
                    {ticket.paymentStatus}
                  </span>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/ticket/${ticket._id}`);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyTickets;