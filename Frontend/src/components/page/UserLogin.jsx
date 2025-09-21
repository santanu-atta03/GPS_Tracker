import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
const UserLogin = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate()
  useEffect(() => {
    const fatch = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });
        const res = await axios.post(
          "http://localhost:5000/api/v1/user/crete/User",
          {
            fullname: user.name,
            email: user.email,
            picture: user.picture,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          dispatch(setuser(res.data.userData));
          navigate("/");  
        }
      } catch (error) {
        console.log(error);
      }
    };
  }, [getAccessTokenSilently, navigate, user]);
  return <div></div>;
};

export default UserLogin;
