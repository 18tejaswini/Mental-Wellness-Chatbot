import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import Chatbot from "./components/chatbot";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Chatbot />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
