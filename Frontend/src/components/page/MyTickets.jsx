import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2, Ticket, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";

const MyTickets = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/Bus/user/all-ticket",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTickets(res.data.allTicket || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTickets();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        <span className="ml-2 text-gray-600">Loading your tickets...</span>
      </div>
    );

  if (tickets.length === 0)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Ticket className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-gray-600">No tickets found yet.</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-white shadow-lg rounded-2xl p-5 border hover:shadow-xl transition"
            onClick={() => navigate(`/ticket/${ticket._id}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {ticket.busId || "Bus Info"}
              </h2>
              {ticket.paymentStatus === "Success" ? (
                <CheckCircle2 className="text-green-500 w-5 h-5" />
              ) : (
                <XCircle className="text-red-500 w-5 h-5" />
              )}
            </div>

            <p className="text-sm text-gray-600">
              <strong>From:</strong> Stop {ticket.fromIndex} →{" "}
              <strong>To:</strong> Stop {ticket.toIndex}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Distance:</strong> {ticket.passengerDistance} km
            </p>
            <p className="text-sm text-gray-600">
              <strong>Price:</strong> ₹{ticket.ticketPrice}
            </p>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-medium ${
                    ticket.paymentStatus === "Success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {ticket.paymentStatus}
                </span>
              </p>
            </div>

            <button
              onClick={() => console.log("View details for:", ticket._id)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full text-sm transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyTickets;
