// src/components/MenuQRCode.js
import React, { Component } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";

import { QRCodeCanvas } from "qrcode.react";
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";

class MenuQRCode extends Component {
  cleanupBackBlock = null;

  constructor(props) {
    super(props);
    this.state = {
      menuItems: [],
      showQR: false,
    };
  }

  componentDidMount() {
    axios
      .get("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/data")
      .then((response) => {
        const menuItems = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.items || [];

        this.setState({ menuItems });
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });

    this.cleanupBackBlock = blockBrowserBack(() => {});
  }

  generateQR = () => {
    this.setState({ showQR: true });
  };

  goBack = () => {
    this.props.navigate("/admindashboard");
  };

  render() {
    const { menuItems, showQR } = this.state;

    // Recommended: QR should hold Menu page URL, not huge JSON  
    const qrData = "https://purple-island-00b1be310.3.azurestaticapps.net/CustomerDashboard";

    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, #f3f4f6 0%, #ffffff 50%, #f9fafb 100%)",
          }}
        >
          {/* Header */}
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: "#1976d2",
              textShadow: "1px 1px 2px #bbb",
            }}
          >
            🍴 Menu Overview with QR Code
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Table Section */}
          <Box
            sx={{
              overflowX: "auto",
              borderRadius: 3,
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell><b>Item ID</b></TableCell>
                  <TableCell><b>Item Name</b></TableCell>
                  <TableCell><b>Price (₹)</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {menuItems.length > 0 ? (
                  menuItems.map((item) => (
                    <TableRow
                      key={item.Id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f7ff",
                          transition: "0.3s ease",
                        },
                      }}
                    >
                      <TableCell>{item.Id}</TableCell>
                      <TableCell>{item.Name}</TableCell>
                      <TableCell>₹{item.Price}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No Menu Items Found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* Buttons */}
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={this.generateQR}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: "bold",
                  boxShadow: 4,
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                Generate QR Code
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={this.goBack}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: "bold",
                }}
              >
                Back to Dashboard
              </Button>
            </Grid>
          </Grid>

          {/* QR Code Section */}
          {showQR && (
            <Card
              elevation={5}
              sx={{
                mt: 6,
                borderRadius: 4,
                background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 80%)",
                textAlign: "center",
                py: 4,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  color="text.secondary"
                >
                  📱 Scan this QR to view menu
                </Typography>

                <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                  <QRCodeCanvas
                    value={qrData}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#1976d2"
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>
      </Container>
    );
  }
}

export default withNavigation(MenuQRCode);
