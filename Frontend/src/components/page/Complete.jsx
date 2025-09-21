import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { useState } from "react";
import { useEffect } from "react";

const Complete = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const [driverExp, setdriverExp] = useState("");
  const [licenceId, setlicenceId] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `https://gps-tracker-kq2q.vercel.app/api/v1/driver/veryfi/email/${user.email}`
        );
        if (res.data.success) {
          navigate("/"); // already registered driver
        }
      } catch (error) {
        console.log(
          "Verification error:",
          error.response?.data || error.message
        );
      }
    };
    fetchData();
  }, [getAccessTokenSilently, navigate, user]);

  return (
    <>
      <Button onClick={() => navigate("/Login/driver")}>login as driver</Button>

      <Button onClick={() => navigate("/Login/User")}>login as User</Button>
    </>
  );
};

export default Complete;
