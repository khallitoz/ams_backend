import React from "react";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import type { AppProps } from "next/app";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

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
      <GoogleOAuthProvider clientId={clientId}>
        <AppProvider>
          <Navbar />
          <Component {...pageProps} />
        </AppProvider>
      </GoogleOAuthProvider>
    </>
  );
}

export default MyApp;
