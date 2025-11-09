import React, { Component } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
  Fade,
} from "@mui/material";
import { Email, Lock, Phone, VpnKey } from "@mui/icons-material";
import axios from "axios";
import { withNavigation } from "./withNavigation";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      email: "",
      password: "",
      mobileOrEmail: "",
      otp: "",
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarSeverity: "success",
    };
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue, otp: "", mobileOrEmail: "" });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = () => {
    const { email, password } = this.state;
    fetch("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        return data;
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        this.showSnackbar("✅ Login successful!", "success");

        setTimeout(() => {
          if (data.role === "Admin") this.props.navigate("/admindashboard");
          else if (data.role === "User") this.props.navigate("/CustomerDashboard");
          else if (data.role === "Support") this.props.navigate("/ShopDashboard");
          else this.props.navigate("/unauthorized");
        }, 1200);
      })
      .catch((err) => {
        console.error("Login error:", err);
        this.showSnackbar(err.message || "Server error", "error");
      });
  };

  requestOtp = async () => {
    try {
      const res = await axios.post("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/requestotp", {
        mobileOrEmail: this.state.mobileOrEmail,
      });
      this.showSnackbar(res.data.message, "success");
    } catch {
      this.showSnackbar("Failed to send OTP", "error");
    }
  };

  verifyOtp = async () => {
    try {
      const res = await axios.post("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/verify-otp", {
        mobileOrEmail: this.state.mobileOrEmail,
        otp: this.state.otp,
      });
      this.showSnackbar(res.data.message, "success");
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
          this.props.navigate("/admindashboard");
        }, 1000);
      }
    } catch {
      this.showSnackbar("Invalid OTP", "error");
    }
  };

  handleRegister = () => this.props.navigate("/register");

  showSnackbar = (message, severity) => {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
    });
  };

  handleSnackbarClose = () => this.setState({ snackbarOpen: false });

  render() {
    const {
      email,
      password,
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
      tabValue,
    } = this.state;

    return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Fade in timeout={600}>
          <Container maxWidth="sm">
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                backdropFilter: "blur(8px)",
                background: "rgba(255, 255, 255, 0.95)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  align="center"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                >
                  Welcome 👋
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" mb={3}>
                  Sign in to continue
                </Typography>

                <Tabs
                  value={tabValue}
                  onChange={this.handleTabChange}
                  variant="fullWidth"
                  sx={{
                    mb: 3,
                    "& .MuiTab-root": { fontWeight: "bold", textTransform: "none" },
                  }}
                >
                  <Tab label="Email Login" />
                  <Tab label="OTP Login" />
                </Tabs>

                {/* 🔐 Email Login */}
                {tabValue === 0 && (
                  <Fade in timeout={400}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{
                          mt: 3,
                          py: 1.2,
                          fontWeight: "bold",
                          borderRadius: 3,
                          textTransform: "none",
                        }}
                        onClick={this.handleLogin}
                      >
                        Login
                      </Button>
                    </Box>
                  </Fade>
                )}

                {/* 🔢 OTP Login */}
                {tabValue === 1 && (
                  <Fade in timeout={400}>
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <TextField
                            fullWidth
                            label="Mobile / Email"
                            name="mobileOrEmail"
                            value={this.state.mobileOrEmail}
                            onChange={this.handleChange}
                            margin="normal"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={this.requestOtp}
                            fullWidth
                            sx={{
                              borderRadius: 3,
                              height: "48px",
                              fontWeight: "bold",
                            }}
                          >
                            Send
                          </Button>
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Enter OTP"
                        name="otp"
                        value={this.state.otp}
                        onChange={this.handleChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKey color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{
                          mt: 3,
                          py: 1.2,
                          fontWeight: "bold",
                          borderRadius: 3,
                          textTransform: "none",
                        }}
                        onClick={this.verifyOtp}
                      >
                        Verify OTP
                      </Button>
                    </Box>
                  </Fade>
                )}

                <Typography
                  variant="body2"
                  align="center"
                  sx={{
                    mt: 3,
                    cursor: "pointer",
                    color: "primary.main",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={this.handleRegister}
                >
                  Don’t have an account? <strong>Register here</strong>
                </Typography>
              </CardContent>
            </Card>
          </Container>
        </Fade>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={this.handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={this.handleSnackbarClose}
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
}

export default withNavigation(LoginPage);
