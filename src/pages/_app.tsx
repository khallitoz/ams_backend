import React from "react";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import type { AppProps } from "next/app";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <AppProvider>
          <Navbar />
          <Component {...pageProps} />
          <ToastContainer />
        </AppProvider>
      </GoogleOAuthProvider>
    </>
  );
}

export default MyApp;
