import React from "react";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../authcontext/AuthContext";
import Navbar from "../components/Navbar";
import { ToastContainer } from "react-toastify";
import type { AppProps } from "next/app";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Global ToastContainer - Single Instance */}

      <AuthProvider>
        <AppProvider>
          <Navbar />
          <Component {...pageProps} />
        </AppProvider>
        <ToastContainer />
      </AuthProvider>
    </>
  );
}

export default MyApp;
