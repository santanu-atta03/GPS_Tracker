import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import Navbar from '../shared/Navbar';

const CreateBus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [deviceID, setDeviceID] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const res = await axios.post(
        "http://localhost:5000/api/v1/Bus/createbus",
        { deviceID, from, to },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Bus created successfully!");
      setDeviceID("");
      setFrom("");
      setTo("");
      navigate("/Bus")
    } catch (error) {
      console.error("Error creating bus:", error);
      setSuccess("Failed to create bus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto mt-6 shadow-xl rounded-2xl border border-green-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 text-center">Create New Bus</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="deviceID" className="block text-sm font-medium text-gray-700 mb-2">Device ID</Label>
                <Input
                  id="deviceID"
                  value={deviceID}
                  onChange={(e) => setDeviceID(e.target.value)}
                  placeholder="Enter device ID"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <Label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">From</Label>
                <Input
                  id="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter starting point"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <Label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">To</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? "Creating..." : "Create Bus"}
              </Button>
            </form>
            {success && <p className="mt-4 text-center text-green-700 font-medium">{success}</p>}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Tracker. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default CreateBus;