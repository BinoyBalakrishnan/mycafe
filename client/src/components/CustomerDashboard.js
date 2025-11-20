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
      filteredItems: [],
      cart: [],
      cartOpen: false,
      searchQuery: "",
      categories: [],
      selectedCategory: "All",
    };
  }

  componentDidMount() {
    // axios
    //   .get("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/data")
    //   .then((response) => {
    //     const baseURL = "https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net";
    //     const menuItems = response.data.map((item) => ({
    //       ...item,
    //       ImageUrl: item.ImageUrl
    //         ? item.ImageUrl.startsWith("http")
    //           ? item.ImageUrl
    //           : `${baseURL}${item.ImageUrl.startsWith("/") ? "" : "/"}${item.ImageUrl}`
    //         : "https://via.placeholder.com/400x250?text=No+Image",
    //     }));
    //     this.setState({ menuItems });
    //   })
    axios
  .get("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/data")
  .then((response) => {
    const baseURL = "https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net";

    const menuItems = response.data.map((item) => ({
      ...item,
      ImageUrl: item.ImageUrl
        ? item.ImageUrl.startsWith("http")
          ? item.ImageUrl
          : `${baseURL}${item.ImageUrl.startsWith("/") ? "" : "/"}${item.ImageUrl}`
        : "https://via.placeholder.com/400x250?text=No+Image",
      Category: item.Category || "Others"
    }));

    const categories = ["All", ...new Set(menuItems.map((i) => i.Category))];

    this.setState({ menuItems, filteredItems: menuItems, categories });
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
filterMenu = () => {
  const { menuItems, searchQuery, selectedCategory } = this.state;

  const filtered = menuItems.filter((item) => {
    const matchSearch = item.Name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || item.Category === selectedCategory;

    return matchSearch && matchCategory;
  });

  this.setState({ filteredItems: filtered });
};

handleSearch = (e) => {
  this.setState({ searchQuery: e.target.value }, this.filterMenu);
};

handleCategoryChange = (e) => {
  this.setState({ selectedCategory: e.target.value }, this.filterMenu);
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
logout = () => {
  // Clear any saved session if needed
  localStorage.clear();

  // Navigate back to login page
  this.props.navigate("/");
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
      .post("https://mycafe-backend-d4ddd9e2a6bfcfe7.centralindia-01.azurewebsites.net/api/orderplace", orderData)
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
      background: "linear-gradient(135deg, #eef2f3, #e3f2fd)",
      pb: 6,
    }}
  >
    <Container maxWidth="lg">

      {/* Sticky Header */}
  <Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "white",
    py: { xs: 1.5, sm: 2 },
    mb: 3,
    borderRadius: 3,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  }}
>
  <Box
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={{ xs: 1.5, sm: 0 }}
  >
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{
        color: "#0077c2",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      Bin Aura - Restaurant
    </Typography>

    <Box display="flex" alignItems="center" gap={2}>
      <IconButton
        onClick={() => this.toggleCart(true)}
        sx={{
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
          "&:hover": { backgroundColor: "#f1f1f1" },
        }}
      >
        <Badge badgeContent={cart.length} color="error">
          <ShoppingCartIcon sx={{ fontSize: 30 }} />
        </Badge>
      </IconButton>

      <Button
        variant="contained"
        color="error"
        onClick={this.logout}
        sx={{
          px: 2.5,
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: 3,
        }}
      >
        Logout
      </Button>
    </Box>
  </Box>
</Box>

<Box
  display="flex"
  flexDirection={{ xs: "column", sm: "row" }}
  gap={2}
  mb={4}
  sx={{
    alignItems: "center",
  }}
>
  {/* Search */}
  <input
    type="text"
    placeholder="Search menu..."
    value={this.state.searchQuery}
    onChange={this.handleSearch}
    style={{
      flex: 1,
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px",
    }}
  />

  {/* Category Dropdown */}
  <select
    value={this.state.selectedCategory}
    onChange={this.handleCategoryChange}
    style={{
      flex: 1,
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px",
      backgroundColor: "white",
    }}
  >
    {this.state.categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
</Box>

      {/* Responsive Menu Grid */}
      <Grid container spacing={3}>
        {this.state.filteredItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={item.Id}>
            <Grow in timeout={400 + index * 100}>
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  transition: "0.35s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 30px rgba(0,0,0,0.18)",
                  },
                }}
              >
                {/* Auto responsive images */}
                <CardMedia
  component="img"
  image={item.ImageUrl}
  alt={item.Name}
  sx={{
    width: "100%",
    height: { xs: 180, sm: 200, md: 220 },
    objectFit: "cover",
    borderBottom: "1px solid #eee",
  }}
/>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    {item.Name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {item.Description || "Freshly made with premium ingredients!"}
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                    sx={{ mb: 2 }}
                  >
                    ₹{item.Price}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => this.addToCart(item)}
                    sx={{
                      py: 1.2,
                      borderRadius: 4,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      background: "linear-gradient(90deg, #4caf50, #66bb6a)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #66bb6a, #4caf50)",
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

      {/* Right Drawer Cart */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => this.toggleCart(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "92%", sm: 380 },
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            p: 3,
            background: "#fefefe",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
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
                  <IconButton size="small" color="error" onClick={() => this.decreaseQuantity(item.Id)}>
                    <RemoveIcon />
                  </IconButton>

                  <Typography mx={1}>{item.Quantity}</Typography>

                  <IconButton size="small" color="primary" onClick={() => this.addToCart(item)}>
                    <AddIcon />
                  </IconButton>

                  <IconButton size="small" color="error" onClick={() => this.removeFromCart(item.Id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" align="center" fontWeight="bold">
              Total: ₹{this.calculateTotal()}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.3,
                borderRadius: 4,
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
                background: "linear-gradient(90deg, #4caf50, #66bb6a)",
              }}
              onClick={this.placeOrder}
            >
              ✔️ Place Order
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
