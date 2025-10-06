import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import QRCode from "react-qr-code";
import { Loader2 } from "lucide-react";
import Navbar from "../shared/Navbar";

const TicketDetails = () => {
  const { ticketid } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/Bus/get-ticket/${ticketid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTicket(res.data.ticket);
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTicket();
  }, [ticketid, getAccessTokenSilently, isAuthenticated]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2 text-blue-800">Loading ticket...</span>
      </div>
    );

  if (!ticket)
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <p className="text-gray-700 text-lg">No ticket found</p>
      </div>
    );

  return (
    <> 
    <Navbar/>
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-blue-200 py-10 px-4">
      <div className="bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-lg shadow-2xl w-full max-w-md p-6 relative border-2 border-blue-400">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900 tracking-wide">
            HAPPY JOURNEY
          </h1>
        </div>

        {/* Journey Type and Date */}
        <div className="flex justify-between items-center mb-3 text-blue-900">
          <div className="text-base font-semibold">JOURNEY (J)</div>
          <div className="text-base font-semibold">
            {new Date(ticket.createdAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "/")}
          </div>
        </div>

        {/* Price and Payment ID */}
        <div className="flex justify-between items-center mb-2 text-blue-900">
          <div className="text-base font-bold">
            Rs. {ticket.ticketPrice.toFixed(2)}/-
          </div>
          <div className="text-sm font-mono">
            {ticket.razorpay_payment_id?.slice(-10) || "N/A"}
          </div>
        </div>

        {/* Ticket Number */}
        <div className="mb-4 text-blue-900">
          <p className="text-sm font-bold">
             Payment Id.: {ticket.razorpay_payment_id}
          </p>
        </div>

        {/* Route Information */}
        <div className="mb-4 space-y-3">
          {/* From Station */}
          <div className="bg-white bg-opacity-40 rounded p-2 border-l-4 border-orange-500">
            <p className="text-sm text-blue-900 font-semibold">
              {ticket.fromAddress.local}
            </p>
            <p className="text-base text-blue-900 font-bold">
              {ticket.fromAddress.english}
            </p>
          </div>

          {/* To Station */}
          <div className="bg-white bg-opacity-40 rounded p-2 border-l-4 border-green-600">
            <p className="text-sm text-blue-900 font-semibold">
              {ticket.toAddress.local}
            </p>
            <p className="text-base text-blue-900 font-bold">
              {ticket.toAddress.english}
            </p>
          </div>
        </div>

        {/* Passenger Count */}
        <div className="flex gap-8 mb-3 text-blue-900">
          <div className="text-sm font-bold">ADULT : 1</div>
          <div className="text-sm font-bold">CHILD : 0</div>
        </div>

        {/* Class and Train Details */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-blue-900">
          <div className="text-xs">
            <span className="font-semibold">द्वितीय</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold">साधारण</span>
          </div>
          <div className="text-xs font-bold">CLASS: SECOND (II)</div>
          <div className="text-xs font-bold">TRAIN: ORDINARY (O)</div>
          <div className="text-xs">
            <span className="font-semibold">द्वि द्वे</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold">साधारण</span>
          </div>
        </div>

        {/* VIA */}
        <div className="mb-3 text-blue-900 text-xs">
          <span className="font-bold">VIA : ------</span>
        </div>

        {/* SAC and IR Details */}
        <div className="flex justify-between mb-3 text-blue-900 text-xs font-mono">
          <div>SAC:{ticket._id.slice(-6)}</div>
          <div>IR:27AAAGM0289C2ZI</div>
        </div>

        {/* Journey Notice */}
        <div className="text-center mb-3 text-blue-900 text-xs font-semibold">
          Journey Should Commence within 1 hour
        </div>

        {/* Vaccination/Verification */}
        <div className="bg-white rounded p-2 mb-3 text-center">
          <p className="text-red-600 text-xs font-bold">
            VACCINATED:
            {ticket.user?.email?.slice(0, 15) || ticket.email.slice(0, 15)}/
          </p>
          <p className="text-red-600 text-xs font-bold">
            {ticket.user?.name || ticket.name}
          </p>
        </div>

        {/* Ticket ID and Distance */}
        <div className="flex justify-between items-center mb-3 text-blue-900 text-sm font-bold">
          <div>{ticket._id.slice(-6).toUpperCase()}</div>
          <div>Distance: {ticket.passengerDistance}km</div>
        </div>

        {/* Booking Time */}
        <div className="text-blue-900 text-xs mb-4">
          <span className="font-semibold">Booking Time: </span>
          {new Date(ticket.createdAt).toLocaleDateString("en-GB")}{" "}
          {new Date(ticket.createdAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* QR Code */}
        <div className="flex justify-center bg-white p-3 rounded-md shadow-inner">
          <QRCode
            value={JSON.stringify({
              ticketId: ticket._id,
              user: ticket.user?.email || ticket.email,
              busId: ticket.busId,
              from: ticket.fromAddress.english,
              to: ticket.toAddress.english,
            })}
            size={120}
          />
        </div>

        {/* Footer Warning */}
        <div className="mt-4 text-center text-xs text-blue-900 opacity-75">
          It is recommended not to perform factory reset or
        </div>
      </div>
    </div>
    </>
    
  );
};

export default TicketDetails;
