import React from "react";
import Navbar from "../shared/Navbar";
import BusSearch from "./BusSearch";
import SupportPopover from "./SupportPopover";

const Home = () => {
  return (
    <>
      <BusSearch />
      <SupportPopover />
    </>
  );
};

export default Home;
