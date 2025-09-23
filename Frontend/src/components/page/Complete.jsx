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
          `${import.meta.env.VITE_BASE_URL}/driver/veryfi/email/${user.email}`
        );
        dispatch(setuser(res.data.newUser));
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
      <div className="flex justify-center items-center absolute inset-0 gap-3 shadow-2xl ">
        <Button
          onClick={() => navigate("/Login/driver")}
          className="bg-green-500 hover:bg-green-600 cursor-pointer shadow-2xl"
        >
          login as driver
        </Button>

        <Button
          onClick={() => navigate("/Login/User")}
          className="bg-green-500 hover:bg-green-600 cursor-pointer shadow-2xl"
        >
          login as User
        </Button>
      </div>
    </>
  );
};

export default Complete;
