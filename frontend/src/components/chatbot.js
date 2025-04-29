import React, { useState } from "react";
import axios from "axios";
import "./chatbot.css";
import { Link } from "react-router-dom";

const Chatbot = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:5000/login", {
                userId,
                password,
            });
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
            alert("Login successful!");
        } catch (error) {
            alert("Login failed. Check credentials.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        setMessages([]);
        setDisabled(false);
        setInput("");
    };
    

    const sendMessage = async () => {
        if (!input.trim() || disabled) return;

        setLoading(true);
        const userMessage = { role: "user", content: input };
        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/chat",
                { message: input },
                { headers: { Authorization: token } }
            );
            const botMessage = { role: "bot", content: response.data.response };
            if (response.data.distress_score >= 80 || response.data.avg_distress >= 80) {
                setDisabled(true);
                botMessage.content += `\n **Distress Level: ${response.data.distress_score.toFixed(2)}%**`;
                botMessage.content += `\n **Average Distress: ${response.data.avg_distress.toFixed(2)}%**`;
                botMessage.content += `\n [Get Immediate Help](${response.data.help_resource})`;

                setMessages([...messages, userMessage, botMessage,
                    { role: "system", content: " Chat has been disabled for your well-being. Please seek professional help." }
                ]);
            } 
            else if(response.data.response==="Sorry, I'm experiencing issues. Please try again later."){
                setMessages([...messages, userMessage, botMessage]);
            } 
            else {
                botMessage.content += `\n *Average Distress: ${response.data.avg_distress.toFixed(2)}%*`;
                setMessages([...messages, userMessage, botMessage]);
            }

        } catch (error) {
            console.error("Error:", error);
        }

        setInput("");
        setLoading(false);
    };

    return (
        <div className="chat-container">
            <h2>Mental Wellness Chatbot</h2>
            {!token ? (
                <div className="login-box">
                    <input
                        type="text"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <>
                    <div className="chat-header">
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                    <div key={index} className={msg.role === "user" ? "user-msg" : msg.role === "system" ? "system-msg" : "bot-msg"}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={disabled ? "⚠️ Chat disabled for safety" : "Type a message..."}
                            disabled={disabled}
                        />
                        <button onClick={sendMessage} disabled={loading || disabled}>
                            {loading ? "..." : "Send"}
                        </button>
                    </div>
                    <Link to="/dashboard">
                        <button style={{ marginTop: "20px" }}>View Wellness Dashboard</button>
                    </Link>
                </>
            )}
        </div>
    );
};

export default Chatbot;
