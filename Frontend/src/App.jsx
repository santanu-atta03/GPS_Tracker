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
import NearbyPOIMap from "./components/page/NearbyPOIMap";
import ReviewForm from "./components/page/ReviewForm";
import FllowBusMap from "./components/page/FllowBusMap";
import RazorpayPayment from "./components/page/RazorpayPayment";
import MyTickets from "./components/page/MyTickets";
import TicketDetails from "./components/page/TicketDetails";
import SupportChat from "./components/page/SupportChat";

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
    {
      path: "/nearBy/search",
      element: <NearbyPOIMap />,
    },
    {
      path: "/bus/review/:busId",
      element: <ReviewForm />,
    },
    {
      path: "/fllow/path",
      element: <FllowBusMap />,
    },
    {
      path: "/makepayment/:deviceid",
      element: <RazorpayPayment />,
    },
    {
      path: "/find/ticket",
      element: <MyTickets />,
    },
    {
      path: "/ticket/:ticketid",
      element: <TicketDetails />,
    },
    {
      path: "/Suport-chat-bot",
      element: <SupportChat />,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
