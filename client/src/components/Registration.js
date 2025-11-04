import React, { Component } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AppRegistration,
  Email,
  Person,
  Store,
  Lock,
  Phone,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";

class Registration extends Component {
  cleanupBackBlock = null;
  state = {
    firstName: '',
    lastName: '',
    restaurantName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    errors: {},
    snackbarOpen: false,
    snackbarMessage: "",
    snackbarSeverity: "success"
  };

  componentDidMount() {
    this.cleanupBackBlock = blockBrowserBack(() => {
      alert("You can't go back from this page!");
    });
  }

  componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  showSnackbar = (message, severity) => {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity
    });
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  togglePasswordVisibility = (field) => {
    this.setState((prevState) => ({ [field]: !prevState[field] }));
  };

  validateForm = () => {
    const { firstName, lastName, restaurantName, email, mobile, password, confirmPassword } = this.state;
    let errors = {};
    let isValid = true;

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!restaurantName.trim()) {
      errors.restaurantName = 'Restaurant name is required';
      isValid = false;
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }
    if (!mobile.trim()) {
      errors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleBack = () => {
    this.props.navigate("/");
  };

  handleRegister = (e) => {
    e.preventDefault();
    if (this.validateForm()) {
      axios.post('http://localhost:5000/api/regpostdata', {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        restaurantName: this.state.restaurantName,
        email: this.state.email,
        mobile: this.state.mobile,
        password: this.state.password
      })
      .then((response) => {
        this.showSnackbar('🎉 Registration successful!', 'success');
        this.setState({
          firstName: '',
          lastName: '',
          restaurantName: '',
          email: '',
          mobile: '',
          password: '',
          confirmPassword: ''
        });
      })
      .catch((error) => {
        const errMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
        this.showSnackbar(errMsg, 'error');
      });
    }
  };

  render() {
    const {
      firstName, lastName, restaurantName, email, mobile,
      password, confirmPassword, showPassword, showConfirmPassword,
      errors, snackbarOpen, snackbarMessage, snackbarSeverity
    } = this.state;

    return (
      <BoxWrapper>
        <Fade in timeout={700}>
          <Container maxWidth="sm">
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
                p: 3
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  align="center"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                >
                  <AppRegistration sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Restaurant Registration
                </Typography>

                <Typography variant="subtitle1" align="center" color="text.secondary" mb={3}>
                  Fill in your details to create an account
                </Typography>

                <form onSubmit={this.handleRegister}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={firstName}
                        onChange={this.handleChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={lastName}
                        onChange={this.handleChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Restaurant Name"
                        name="restaurantName"
                        value={restaurantName}
                        onChange={this.handleChange}
                        error={!!errors.restaurantName}
                        helperText={errors.restaurantName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Store color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        name="mobile"
                        value={mobile}
                        onChange={this.handleChange}
                        error={!!errors.mobile}
                        helperText={errors.mobile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={this.handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => this.togglePasswordVisibility('showPassword')}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={this.handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => this.togglePasswordVisibility('showConfirmPassword')}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<ArrowBack />}
                          onClick={this.handleBack}
                          sx={{
                            color: "#fff",
                            fontWeight: "bold",
                            background: "linear-gradient(90deg, #667eea, #764ba2)",
                            borderRadius: 3,
                            "&:hover": {
                              background: "linear-gradient(90deg, #764ba2, #667eea)"
                            },
                          }}
                        >
                          Back
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          type="submit"
                          variant="contained"
                          startIcon={<AppRegistration />}
                          sx={{
                            color: "#fff",
                            fontWeight: "bold",
                            background: "linear-gradient(90deg, #FF512F, #DD2476)",
                            borderRadius: 3,
                            "&:hover": {
                              background: "linear-gradient(90deg, #DD2476, #FF512F)"
                            },
                          }}
                        >
                          Register
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
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
          <Alert onClose={this.handleSnackbarClose} severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </BoxWrapper>
    );
  }
}

const BoxWrapper = (props) => (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    {props.children}
  </div>
);

export default withNavigation(Registration);
