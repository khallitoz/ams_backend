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
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1} // Prevent duplicate toasts
      />
      <AuthProvider>
        <AppProvider>
          <Navbar />
          <Component {...pageProps} />
        </AppProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
