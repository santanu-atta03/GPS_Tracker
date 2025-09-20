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

      const res = await axios.put(
        "https://gps-tracker-kq2q.vercel.app/api/v1/driver/update/profile",
        { name, licenceId, driverExp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setuser(res.data.newDetails));
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
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

            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Licence ID
                      </label>
                      <Input
                        value={licenceId}
                        onChange={(e) => setLicenceId(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter your licence ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Driver Experience (Years)
                      </label>
                      <Input
                        value={driverExp}
                        onChange={(e) => setDriverExp(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter years of experience"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Updating..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-700">
                          Auth0 ID
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm break-all">
                        {usere.auth0Id}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-gray-700">
                          Licence ID
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {usere.licenceId || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-semibold text-gray-700">
                          Experience
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {usere.driverExp
                          ? `${usere.driverExp} years`
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-semibold text-gray-700">
                          Last Updated
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {new Date(usere.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* System ID (Full Width) */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Hash className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-semibold text-gray-700">
                        System ID
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm break-all">
                      {usere._id}
                    </p>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* Success/Error Message */}
              {message && (
                <div
                  className={`rounded-xl p-4 text-center ${
                    message.includes("successfully")
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <p className="font-medium">{message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Cards */}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Bus Tracker. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Profile;
