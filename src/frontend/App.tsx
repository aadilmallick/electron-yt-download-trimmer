import React from "react";

import { HashRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Trim from "./pages/Trim";

const App = () => {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trim" element={<Trim />} />
        </Routes>
      </HashRouter>
      <ToastContainer />
    </>
  );
};

export default App;
