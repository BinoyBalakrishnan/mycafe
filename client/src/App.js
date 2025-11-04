// import React, { Component } from "react";
// import "./App.css";

// class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       message: "",
//     };
//   }

//   componentDidMount() {
//     fetch("/api/message")
//       .then((res) => res.json())
//       .then((data) => this.setState({ message: data.message }))
//       .catch((err) => console.error(err));
//   }

//   render() {
//     return (
//       <div className="App">
//         <h1>React + Express (Class Components)</h1>
//         <p>{this.state.message}</p>
//       </div>
//     );
//   }
// }

// export default App;
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';
import AdminDashboard from '../src/components/AdminDashboard';
import GenerateQRCode  from './components/GenerateQRCode';
import CustomerDashboard from './components/CustomerDashboard';
import ShopDashboard from './components/ShopDashboard';
import CustomerQRPage from "./components/CustomerQRPage";


class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Routes>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/register" element={<Registration />} />
             <Route path="/" element={<Login />} />
             <Route path="/admindashboard" element={<AdminDashboard />} />
             <Route path="/generateQR" element={<GenerateQRCode />} />
             <Route path="/customerdashboard" element={<CustomerDashboard />} />
             <Route path="/shopdashboard" element={<ShopDashboard />} />
             <Route path="/customerqr" element={<CustomerQRPage />} />

          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
