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

function App() {
  useEffect(() => {
    // Simple Google Translate initialization
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,ta,te,kn,ml,bn,gu,mr,pa,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    // Load script only once
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
      element: <Profile />
    },
    {
      path: "/view/map",
      element: <BusMap />
    }
  ]);

  return (
    <>
      <RouterProvider router={approute} />
      {/* Simple Google Translate Element */}
      <div id="google_translate_element" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }}></div>
    </>
  );
}

export default App;