import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  CreditCard,
  Calendar,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Clock,
  Hash,
} from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { setuser } from "../../Redux/auth.reducer";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";

const Profile = () => {
  const { usere } = useSelector((store) => store.auth);
  const { getAccessTokenSilently } = useAuth0();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(usere?.name || "");
  const [licenceId, setLicenceId] = useState(usere?.licenceId || "");
  const [driverExp, setDriverExp] = useState(usere?.driverExp || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  if (!usere) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <p className="text-center text-gray-600 text-lg">
            No user data found.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      console.log(token);
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/driver/update/profile`,
        { name, licenceId, driverExp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setuser(res.data.newDetails));
      setMessage("Profile updated successfully!");
      setIsEditing(false);
       toast(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
       const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl rounded-2xl border border-green-100 bg-white/80 backdrop-blur-sm">
            {/* Profile Header */}
            <CardHeader className="flex flex-col items-center space-y-4 pb-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-green-200 shadow-lg">
                  {usere.picture ? (
                    <AvatarImage
                      src={usere.picture}
                      alt={usere.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-green-100 text-green-700 text-3xl font-bold">
                      {usere.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-1">
                  {usere.name}
                </CardTitle>
                <div className="flex items-center justify-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{usere.email}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Additional Info Cards */}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Sewa. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Profile;
