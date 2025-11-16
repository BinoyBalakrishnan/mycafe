// src/components/ShopDashboard.js
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
  Box,
  Button,
  Grid,
  Divider,
  Fade,
} from "@mui/material";
import * as XLSX from "xlsx";
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";

class ShopDashboard extends Component {
  cleanupBackBlock = null;

  constructor(props) {
    super(props);
    this.state = {
      menuOrderItems: [],
    };
  }

  componentDidMount() {
    axios
      .get("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/OrderItemdata")
      .then((response) => {
        const menuOrderItems = response.data;
        this.setState({ menuOrderItems });
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });

    this.cleanupBackBlock = blockBrowserBack(() => {});
  }

  componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  // ✅ Download Excel with total row
  downloadExcel = () => {
    const { menuOrderItems } = this.state;

    if (!menuOrderItems.length) {
      alert("No data available to download!");
      return;
    }

    const totalAmount = menuOrderItems.reduce(
      (sum, item) => sum + (item.SubTotal || 0),
      0
    );

    const dataForExcel = menuOrderItems.map((item) => ({
      "Order ID": item.OrderId,
      "Item ID": item.MenuItemId,
      "Item Name": item.MenuItemName,
      Quantity: item.Quantity,
      "SubTotal (₹)": item.SubTotal,
    }));

    dataForExcel.push({
      "Order ID": "",
      "Item ID": "",
      "Item Name": "🧾 Total",
      Quantity: "",
      "SubTotal (₹)": totalAmount,
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const columnWidths = Object.keys(dataForExcel[0]).map((key) => ({
      wch: Math.max(key.length + 2, 15),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, "Restaurant_Orders.xlsx");
  };

  render() {
    const { menuOrderItems } = this.state;

    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Fade in timeout={700}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background:
                "linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)",
            }}
          >
            {/* Title */}
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
              sx={{
                color: "#1b5e20",
                textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              🍴 Restaurant Order Dashboard
            </Typography>

            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              gutterBottom
            >
              Real-time overview of all customer orders with total amount summary
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Responsive Table */}
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                    <TableCell>
                      <b>Order ID</b>
                    </TableCell>
                    <TableCell>
                      <b>Item ID</b>
                    </TableCell>
                    <TableCell>
                      <b>Item Name</b>
                    </TableCell>
                    <TableCell>
                      <b>Quantity</b>
                    </TableCell>
                    <TableCell>
                      <b>SubTotal (₹)</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuOrderItems.length > 0 ? (
                    <>
                      {menuOrderItems.map((item, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#f1f8e9",
                              transition: "0.3s",
                            },
                          }}
                        >
                          <TableCell>{item.OrderId}</TableCell>
                          <TableCell>{item.MenuItemId}</TableCell>
                          <TableCell>{item.MenuItemName}</TableCell>
                          <TableCell>{item.Quantity}</TableCell>
                          <TableCell>₹{item.SubTotal}</TableCell>
                        </TableRow>
                      ))}

                      {/* Total Row */}
                      <TableRow sx={{ backgroundColor: "#e0f7fa" }}>
                        <TableCell colSpan={4} align="right">
                          <Typography fontWeight="bold">Total:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" color="primary">
                            ₹
                            {menuOrderItems
                              .reduce(
                                (sum, item) => sum + (item.SubTotal || 0),
                                0
                              )
                              .toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          No Orders Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Download Button */}
            <Grid container justifyContent="center" sx={{ mt: 5 }}>
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={this.downloadExcel}
                  sx={{
                    px: 5,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: "bold",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    background: "linear-gradient(90deg, #4caf50, #66bb6a)",
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "0.2s ease-in-out",
                    },
                  }}
                >
                  ⬇️ Download Orders as Excel
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>
    );
  }
}

export default withNavigation(ShopDashboard);
