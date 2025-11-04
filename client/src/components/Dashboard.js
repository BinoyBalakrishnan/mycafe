import { Component } from 'react';
import axios from 'axios';
import {
  Button, Container, Box, TextField,
  Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TablePagination, TableSortLabel, InputAdornment
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { withNavigation } from './withNavigation';
import { blockBrowserBack } from "./BackButtonHelper";

class Dashboard extends Component {
  cleanupBackBlock = null;

  constructor(props) {
    super(props);
    this.state = {
      menuItems: [],
      editedRow: {},
      chartData: [],
      editRowId: null,
      searchQuery: "",
      order: "asc",
      orderBy: "Name",
      page: 0,
      rowsPerPage: 5,
      filterGroup: "All",
    };
  }

  componentDidMount() {
    axios.get('http://localhost:5000/api/data')
      .then(response => {
        const menuItems = response.data;
        const chartData = this.getChartData(menuItems);
        this.setState({ menuItems, chartData });
      })
      .catch(error => console.error('Error fetching items:', error));

    this.cleanupBackBlock = blockBrowserBack(() => {});
  }

  componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  getChartData = (menuItems) => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.map(item => ({
      name: item.Name,
      value: item.Price
    }));
  };

  handleEdit = (row) => this.setState({ editRowId: row.Id, editedRow: { ...row } });
  handleCancel = () => this.setState({ editRowId: null, editedRow: {} });
  handleChange = (e) => this.setState({ editedRow: { ...this.state.editedRow, [e.target.name]: e.target.value } });
  gogenerateQR = () => this.props.navigate("/generateQR");
  goBack = () => this.props.navigate("/admindashboard");

  handleSave = (id) => {
    const { Name, Price, Description } = this.state.editedRow;
    if (!Name || !Price) return alert("Name and Price are required.");

    axios.put(`http://localhost:5000/api/items/${id}`, { Name, Price, Description })
      .then(res => {
        alert(res.data.message || 'Item updated successfully');
        const updatedItems = this.state.menuItems.map(item =>
          item.Id === id ? { ...item, Name, Price, Description } : item
        );
        this.setState({
          menuItems: updatedItems,
          editRowId: null,
          editedRow: {},
          chartData: this.getChartData(updatedItems)
        });
      })
      .catch(err => {
        console.error('Update error:', err);
        alert('Failed to update item.');
      });
  };

  deleteItem = (id) => {
    axios.delete(`http://localhost:5000/api/items/${id}`)
      .then(res => {
        alert(res.data.message || 'Item deleted');
        const filtered = this.state.menuItems.filter(item => item.Id !== id);
        this.setState({
          menuItems: filtered,
          chartData: this.getChartData(filtered)
        });
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert("Failed to delete item.");
      });
  };

  handleSearchChange = (e) => this.setState({ searchQuery: e.target.value, page: 0 });
  handleFilterChange = (e) => this.setState({ filterGroup: e.target.value, page: 0 });
  handleRequestSort = (property) => {
    const isAsc = this.state.orderBy === property && this.state.order === "asc";
    this.setState({ order: isAsc ? "desc" : "asc", orderBy: property });
  };
  handleChangePage = (e, newPage) => this.setState({ page: newPage });
  handleChangeRowsPerPage = (e) => this.setState({ rowsPerPage: parseInt(e.target.value, 10), page: 0 });

  descendingComparator = (a, b, orderBy) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0);
  getComparator = (order, orderBy) =>
    order === "desc"
      ? (a, b) => this.descendingComparator(a, b, orderBy)
      : (a, b) => -this.descendingComparator(a, b, orderBy);

  getFilteredRows = () => {
    const { menuItems, searchQuery, filterGroup, order, orderBy } = this.state;
    let rows = [...menuItems];
    if (searchQuery.trim()) {
      rows = rows.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    if (filterGroup !== "All") rows = rows.filter(row => row.Name === filterGroup);
    rows.sort(this.getComparator(order, orderBy));
    return rows;
  };

  renderTable() {
    const { editRowId, editedRow, order, orderBy, page, rowsPerPage, searchQuery, filterGroup } = this.state;
    const filteredRows = this.getFilteredRows();
    const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Card elevation={4} sx={{ borderRadius: 3, p: 3, background: "linear-gradient(145deg, #ffffff, #f3f4f6)" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: "#2e7d32" }}>
          🍴 Manage Menu Items
        </Typography>

        {/* Search + Filter */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={this.handleSearchChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Filter by Item</InputLabel>
              <Select value={filterGroup} onChange={this.handleFilterChange} label="Filter by Item">
                <MenuItem value="All">All</MenuItem>
                {Array.from(new Set(this.state.menuItems.map(item => item.Name))).map((group, index) => (
                  <MenuItem key={index} value={group}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={orderBy === 'Name'} direction={orderBy === 'Name' ? order : "asc"} onClick={() => this.handleRequestSort('Name')}>
                    <b>Item Name</b>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={orderBy === 'Price'} direction={orderBy === 'Price' ? order : "asc"} onClick={() => this.handleRequestSort('Price')}>
                    <b>Price (₹)</b>
                  </TableSortLabel>
                </TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row, index) => (
                <TableRow key={row.Id} sx={{ "&:hover": { backgroundColor: "#f1f8e9" } }}>
                  <TableCell>
                    {editRowId === row.Id ? (
                      <TextField name="Name" value={editedRow.Name || ''} onChange={this.handleChange} size="small" />
                    ) : row.Name}
                  </TableCell>
                  <TableCell>
                    {editRowId === row.Id ? (
                      <TextField name="Price" type="number" value={editedRow.Price || ''} onChange={this.handleChange} size="small" />
                    ) : `₹${row.Price}`}
                  </TableCell>
                  <TableCell>
                    {editRowId === row.Id ? (
                      <TextField name="Description" value={editedRow.Description || ''} onChange={this.handleChange} size="small" />
                    ) : row.Description}
                  </TableCell>
                  <TableCell>
                    {editRowId === row.Id ? (
                      <>
                        <Button variant="contained" color="success" onClick={() => this.handleSave(row.Id)} size="small">Save</Button>
                        <Button variant="outlined" onClick={this.handleCancel} size="small" sx={{ ml: 1 }}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="contained" onClick={() => this.handleEdit(row)} size="small" color="primary" sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" /> Edit
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => this.deleteItem(row.Id)} size="small">
                          <DeleteIcon fontSize="small" /> Delete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={this.handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={this.handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    );
  }

  renderBarChart() {
    const { chartData } = this.state;
    return (
      <Card elevation={4} sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          📊 Menu Item Price Overview
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Price ₹', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4caf50" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  render() {
    return (
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 5 }}>
        <Container>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center', color: "#2e7d32" }}>
            🌿 Restaurant Admin Dashboard
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>{this.renderTable()}</Grid>
            <Grid item xs={12} md={5}>{this.renderBarChart()}</Grid>
          </Grid>

          {/* Bottom Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, gap: 2 }}>
            <Button variant="contained" color="primary" onClick={this.goBack} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
              Back
            </Button>
            <Button variant="contained" color="success" onClick={this.gogenerateQR} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
              Generate QR Code
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default withNavigation(Dashboard);
