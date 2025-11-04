import React, { Component } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Badge,
  IconButton,
  Drawer,
  Divider,
  Grow,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";

class CustomerMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuItems: [],
      cart: [],
      cartOpen: false,
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:5000/api/data")
      .then((response) => {
        const baseURL = "http://localhost:5000";
        const menuItems = response.data.map((item) => ({
          ...item,
          ImageUrl: item.ImageUrl
            ? item.ImageUrl.startsWith("http")
              ? item.ImageUrl
              : `${baseURL}${item.ImageUrl.startsWith("/") ? "" : "/"}${item.ImageUrl}`
            : "https://via.placeholder.com/400x250?text=No+Image",
        }));
        this.setState({ menuItems });
      })
      .catch((error) => {
        console.error("Error fetching menu:", error);
      });

    this.cleanupBackBlock = blockBrowserBack(() => {});
  }

  componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  addToCart = (item) => {
    this.setState((prevState) => {
      const existingItem = prevState.cart.find(
        (cartItem) => cartItem.Id === item.Id
      );
      if (existingItem) {
        const updatedCart = prevState.cart.map((cartItem) =>
          cartItem.Id === item.Id
            ? { ...cartItem, Quantity: cartItem.Quantity + 1 }
            : cartItem
        );
        return { cart: updatedCart };
      } else {
        return { cart: [...prevState.cart, { ...item, Quantity: 1 }] };
      }
    });
  };

  decreaseQuantity = (itemId) => {
    this.setState((prevState) => {
      const updatedCart = prevState.cart
        .map((cartItem) =>
          cartItem.Id === itemId
            ? { ...cartItem, Quantity: cartItem.Quantity - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.Quantity > 0);
      return { cart: updatedCart };
    });
  };

  removeFromCart = (itemId) => {
    this.setState((prevState) => ({
      cart: prevState.cart.filter((cartItem) => cartItem.Id !== itemId),
    }));
  };

  calculateTotal = () => {
    return this.state.cart
      .reduce((total, item) => total + item.Price * item.Quantity, 0)
      .toFixed(2);
  };

  toggleCart = (open) => {
    this.setState({ cartOpen: open });
  };

  placeOrder = () => {
    const { cart } = this.state;
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    const orderData = {
      customerName: "Guest",
      items: cart,
    };

    axios
      .post("http://localhost:5000/api/orderplace", orderData)
      .then((res) => {
        if (res.data?.orderId) {
          alert(`✅ ${res.data.message}\nOrder ID: ${res.data.orderId}`);
        } else {
          alert("✅ Order placed successfully!");
        }
        this.setState({ cart: [], cartOpen: false });
      })
      .catch((err) => {
        console.error("Order placement error:", err);
        alert("❌ Failed to place order. Please try again.");
      });
  };

  render() {
    const { menuItems, cart, cartOpen } = this.state;

    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f7f8fa, #e3f2fd)",
          py: 4,
        }}
      >
        <Container>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              🍽️ MyCafe Menu
            </Typography>

            <IconButton
              color="primary"
              onClick={() => this.toggleCart(true)}
              sx={{
                position: "relative",
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              <Badge
                badgeContent={cart.length}
                color="error"
                sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem" } }}
              >
                <ShoppingCartIcon fontSize="large" />
              </Badge>
            </IconButton>
          </Box>

          {/* Menu Grid */}
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.Id}>
                <Grow in timeout={500 + index * 100}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "0.4s",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.ImageUrl}
                      alt={item.Name}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="600">
                        {item.Name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.Description || "Delicious and freshly made!"}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="success.main"
                        mb={1}
                      >
                        ₹{item.Price}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => this.addToCart(item)}
                        sx={{
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #43a047, #66bb6a)",
                          fontWeight: "bold",
                          textTransform: "none",
                          "&:hover": {
                            background: "linear-gradient(90deg, #66bb6a, #43a047)",
                          },
                        }}
                      >
                        🛒 Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Floating Drawer Cart */}
          <Drawer
            anchor="right"
            open={cartOpen}
            onClose={() => this.toggleCart(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: { xs: "90%", sm: 400 },
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                p: 2,
                background: "#f9f9f9",
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                🛍 Your Cart
              </Typography>
              <IconButton onClick={() => this.toggleCart(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {cart.length === 0 ? (
              <Typography align="center" color="text.secondary">
                Your cart is empty
              </Typography>
            ) : (
              <>
                {cart.map((item) => (
                  <Box
                    key={item.Id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Box>
                      <Typography fontWeight="600">{item.Name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{item.Price} × {item.Quantity}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => this.decreaseQuantity(item.Id)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography mx={1}>{item.Quantity}</Typography>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => this.addToCart(item)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => this.removeFromCart(item.Id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" align="center" fontWeight="bold" color="text.primary">
                  Total: ₹{this.calculateTotal()}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 5,
                    background: "linear-gradient(90deg, #43a047, #66bb6a)",
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                  onClick={this.placeOrder}
                >
                  ✅ Place Order
                </Button>
              </>
            )}
          </Drawer>
        </Container>
      </Box>
    );
  }
}

export default withNavigation(CustomerMenu);
