import React from "react";
import { Link } from "react-router-dom";

const powerBiUrl = process.env.REACT_APP_POWERBI_URL;
function Dashboard() {
  return (
    <div style={{ height: "100%", width: "100%", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link to="/">
          <button style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Back to Chat
          </button>
        </Link>
      </div>
      <div style={{
        height: "90vh",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)"
      }}>
        <iframe
          title="Mental Wellness Dashboard"
          width="100%"
          height="100%"
          src={powerBiUrl}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default Dashboard;