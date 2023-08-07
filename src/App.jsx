import React, { Suspense } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ToastContainer, toast } from 'react-toastify';
import AOS from "aos";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getLibrary } from "./utils/web3React";

///////////////////////////////////////
const Home = React.lazy(() => import("./Pages/Home"));
//animation aos init
AOS.init();
const App = () => {
  return (
    <div>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Suspense fallback={<div />}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} exact />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </Web3ReactProvider>
      <ToastContainer/>
    </div>

  );
};

export default App;
