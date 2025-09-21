import "./App.css";
import BusDetailsPage from "./components/page/BusDetailsPage";
import Home from "./components/page/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Complete from "./components/page/Complete";
import Bus from "./components/page/Bus";
import CreateBus from "./components/page/CreateBus";
import Profile from "./components/page/Profile";
import BusMap from "./components/page/BusMap";
import { useEffect } from "react";
import DriverLogin from "./components/page/DriverLogin";
import UserLogin from "./components/page/UserLogin";

function App() {
  const approute = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/bus/:deviceID",
      element: <BusDetailsPage />,
    },
    {
      path: "/complete/profile",
      element: <Complete />,
    },
    {
      path: "/Bus",
      element: <Bus />,
    },
    {
      path: "/createbus",
      element: <CreateBus />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/view/map",
      element: <BusMap />,
    },
    {
      path: "/Login/driver",
      element: <DriverLogin />,
    },
    {
      path: "/Login/User",
      element: <UserLogin />,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
