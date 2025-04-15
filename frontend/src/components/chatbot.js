import React, { useState } from "react";
import axios from "axios";
import "./chatbot.css";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);  

    const sendMessage = async () => {
        if (!input.trim() || disabled) return;  

        setLoading(true);
        const userMessage = { role: "user", content: input };
        setMessages([...messages, userMessage]); 

        try {
            const response = await axios.post("http://127.0.0.1:5000/chat", { message: input });
            const botMessage = { role: "bot", content: response.data.response };

            
            if (response.data.distress_score >= 80) {
                setDisabled(true);  
                botMessage.content += `\n🚨 **Distress Level: ${response.data.distress_score}%**`;
                botMessage.content += `\n🔗 [Get Immediate Help](${response.data.help_resource})`;

                setMessages([...messages, userMessage, botMessage, 
                    { role: "system", content: " Chat has been disabled for your well-being. Please seek professional help." }
                ]);
            } else {
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
        </div>
    );
};

export default Chatbot;
