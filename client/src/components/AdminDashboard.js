// src/components/AdminDashboard.js
import { Component } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";

class AdminDashboard extends Component {
  cleanupBackBlock = null;

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      price: "",
      description: "",
      image: null,
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarSeverity: "success",
      menuItems: [],
    };
  }

  componentDidMount() {
    axios
      .get("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/data")
      .then((response) => {
        this.setState({ menuItems: response.data });
      })
      .catch((error) => console.error("Error fetching items:", error));

    this.cleanupBackBlock = blockBrowserBack(() => {
      alert("You can't go back from the Dashboard!");
    });
  }

  componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleImageChange = (event) => {
    this.setState({ image: event.target.files[0] });
  };

  showSnackbar = (message, severity) => {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
    });
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  handleSubmit = () => {
    const { name, price, description, image } = this.state;

    if (!name || !price) {
      this.showSnackbar("Name and Price are required fields.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (image) formData.append("image", image);

    axios
      .post("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/postdata", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        this.showSnackbar("✅ Item added successfully!", "success");
        this.setState({
          name: "",
          description: "",
          price: "",
          image: null,
        });
        document.getElementById("imageInput").value = "";
      })
      .catch((error) => {
        console.error("Submission failed:", error);
        const errMsg =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";
        this.showSnackbar(errMsg, "error");
      });
  };

  goDashboard = () => {
    this.props.navigate("/dashboard");
  };

  render() {
    const {
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
      name,
      price,
      description,
    } = this.state;

    return (
      <Container
        maxWidth="sm"
        sx={{
          mt: 8,
          mb: 8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            width: "100%",
            background:
              "linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3f4f6 100%)",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="bold"
            sx={{
              color: "#1565c0",
              textShadow: "1px 1px 2px #aaa",
            }}
          >
            🛠️ Admin Dashboard
          </Typography>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ mb: 3, fontSize: "0.95rem" }}
          >
            Add or update your restaurant’s menu items with ease.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Item Name"
              name="name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={this.handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              fullWidth
              multiline
              minRows={2}
              value={description}
              onChange={this.handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              label="Price (₹)"
              name="price"
              type="number"
              variant="outlined"
              fullWidth
              value={price}
              onChange={this.handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />

            {/* Image Upload */}
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                borderRadius: 3,
                py: 1.5,
                borderColor: "#90caf9",
                color: "#1976d2",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              Upload Image
              <input
                id="imageInput"
                type="file"
                hidden
                accept="image/*"
                onChange={this.handleImageChange}
              />
            </Button>
          </Box>

          {/* Buttons */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  boxShadow: 3,
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "0.3s ease",
                  },
                }}
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#fce4ec",
                    transform: "scale(1.03)",
                  },
                }}
                onClick={this.goDashboard}
              >
                Go to Dashboard
              </Button>
            </Grid>
          </Grid>

          {/* Snackbar */}
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
              sx={{ fontSize: "1rem" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    );
  }
}

export default withNavigation(AdminDashboard);
