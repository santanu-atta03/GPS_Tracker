import "./App.css";
import BusDetailsPage from "./components/page/BusDetailsPage";
import Home from "./components/page/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Complete from "./components/page/Complete";

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
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
