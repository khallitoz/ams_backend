import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material/";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppContext } from "../context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";

const RegisterBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: {
    lg: "center",
    xs: "",
  },
  justifyContent: "center",
  paddingX: "2px",
  marginX: {
    lg: "25%",
    md: "25%",
    xl: "25%",
    sm: "20",
    xs: "auto",
  },
  marginTop: {
    lg: "10%",
    md: "10%",
    xl: "10%",
    sm: "30%",
    xs: "30%",
  },
  width: {
    sm: "400px",
    lg: "600px",
    xl: "800px",
  },
};

const formText = {
  fontSize: "100px",
  width: "300px",
  textColor: "white",
  backgroundColor: "white",
};

const formDesign = {
  borderRadius: "10px solid #1976d2 !important",
  borderTop: "3px solid #24b4eb",
  margin: "auto",
  padding: "20px",
  color: "black",
  backgroundColor: "#fff",
};

const loginbutton = {
  width: "300px",
  marginTop: "10px",
  fontWeight: "bold",
  backgroundColor: "#1c2c54",
  color: "white",
  "&:hover": {
    backgroundColor: "#24b4eb ",
    color: "white",
  },
};

const LoginText = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "5px",
};

interface initialStateValues {
  username: string;
  password: string;
}
const initialState = {
  username: "",
  password: "",
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [values, setValues] = useState<initialStateValues>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAlert, handleGoogleLogin } = useAppContext();
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.SyntheticEvent) =>
    event.preventDefault();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  // const logUser = (e) => {
  //   e.preventDefault();
  //   const { username, password } = values;
  //   if (!username || !password) {
  //     return EmptyErr();
  //   }
  //   const userDetails = { username, password };
  //   loginUser({ userDetails, alertText: "login successful" });
  // };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      try {
        await handleGoogleLogin(response);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
    },
  });

  return (
    <Box sx={RegisterBox}>
      {loading ? (
        // Show spinner only when loading
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh", // Full viewport height to center spinner
          }}
        >
          <CircularProgress
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
      ) : (
        // Show the login form only when not loading
        <Box sx={formDesign}>
          <form>
            <Typography variant="h4" sx={LoginText}>
              Login
            </Typography>

            {/* Username Field */}
            <Box>
              <TextField
                sx={formText}
                margin="normal"
                required
                fullWidth
                name="username"
                id="outlined-basic"
                label="Username"
                variant="outlined"
                value={values.username}
                autoComplete="username"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {/* Password Field */}
            <Box>
              <TextField
                sx={formText}
                margin="normal"
                required
                fullWidth
                id="outlined-basic"
                label="Password"
                variant="outlined"
                name="password"
                value={values.password}
                autoComplete="password"
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        cursor="pointer"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {/* Google Login */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Button
                onClick={googleLogin}
                variant="outlined"
                disabled={loading}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "130%",

                  backgroundColor: "#fff",
                  color: "#757575",
                  textTransform: "none",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <Image
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google logo"
                  width={20}
                  height={20}
                  style={{
                    width: "20px",
                    height: "20px",
                    marginRight: "10px",
                  }}
                />
                Sign in with Google
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </Box>
  );
};

export default Login;
