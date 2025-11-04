import React, { Component } from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

class CustomerQRPage extends Component {
  render() {
    const customerDashboardURL = "http://localhost:3000/customerdashboard"; 
    // ⬆️ Replace with your production URL when deployed

    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Scan to Open Customer Dashboard
          </Typography>

          <Box display="flex" justifyContent="center" mt={3}>
            <QRCodeCanvas
              value={customerDashboardURL}
              size={200}
              bgColor="#ffffff"
              fgColor="#2e7d32"
              level="H"
              includeMargin={true}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mt={2}>
            Point your camera or QR scanner app to open the page.
          </Typography>
        </Paper>
      </Container>
    );
  }
}

export default CustomerQRPage;
