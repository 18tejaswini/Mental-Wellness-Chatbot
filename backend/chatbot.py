import requests
from flask import Flask, request, jsonify, session
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS
import os
from dotenv import load_dotenv
import pyodbc
import jwt

load_dotenv()
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
SERVER_NAME = os.getenv("SERVER_NAME")
SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-3B"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}
conn = pyodbc.connect(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SERVER_NAME};"
    "DATABASE=ChatbotDB;"
    "Trusted_Connection=yes;"
)
cursor = conn.cursor()

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app)
analyzer = SentimentIntensityAnalyzer()
def generate_jwt(user_id):
    payload = {
        "user_id": user_id
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["user_id"]
    except jwt.InvalidTokenError:
        return None
@app.route("/", methods=["GET"])
def home():
    return "Chatbot API is running!"
def analyze_sentiment(text):
    """Analyze user input and return distress score"""
    sentiment_scores = analyzer.polarity_scores(text)
    distress_score = abs(sentiment_scores["compound"]) * 100  
    return distress_score
def chat_with_llama(prompt):
    """Send user input to LLaMA with a system prompt for mental wellness support"""
    system_prompt = (
        "You are a mental wellness assistant. Your goal is to provide compassionate, "
        "supportive and evidence-based responses to users struggling with emotional distress.\n\n"
    )
    
    full_prompt = system_prompt + prompt  
    
    response = requests.post(API_URL, headers=HEADERS, json={"inputs": full_prompt})
    
    if response.status_code == 200:
        return response.json()[0]["generated_text"]  
    else:
        return "Sorry, I'm experiencing issues. Please try again later."
@app.route("/chat", methods=["POST"])
def chat():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401
    user_id = verify_jwt(token)
    if not user_id:
        return jsonify({"message": "Invalid token"}), 401
    """API endpoint for chatbot with session-based distress score tracking"""
    data = request.json
    user_message = data.get("message", "")
    
    if not user_message:
        return jsonify({"response": "Please enter a valid message."})
    
    distress_score = analyze_sentiment(user_message)
    
    distress_history = session.get("distress_scores", [])
    distress_history.append(distress_score)
    N = 5
    if len(distress_history) > N:
        distress_history = distress_history[-N:]
    session["distress_scores"] = distress_history
    avg_distress = sum(distress_history) / len(distress_history)
    if avg_distress >= 80:
        response_text = "I am really sorry that you are feeling this way. You are not alone. Please consider reaching out to a professional for support."
        cursor.execute("""
            INSERT INTO ChatHistory (UserId, UserMessage, BotResponse, DistressScore, AvgDistress)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, user_message, response_text, distress_score, avg_distress))
        conn.commit()
        return jsonify({
            "response": response_text,
            "help_resource": "https://www.mentalhealth.gov/get-help/immediate-help",  
            "distress_score": distress_score,
            "avg_distress": avg_distress
        })
    chatbot_response = chat_with_llama(user_message)
    cursor.execute("""
        INSERT INTO ChatHistory (UserId, UserMessage, BotResponse, DistressScore, AvgDistress)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, user_message, chatbot_response, distress_score, avg_distress))
    conn.commit()
    return jsonify({
        "response": chatbot_response,
        "distress_score": distress_score,
        "avg_distress": avg_distress
    })
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user_id = data.get("userId")
    password = data.get("password")
    cursor.execute("SELECT PasswordHash FROM Users WHERE UserId = ?", (user_id,))
    row = cursor.fetchone()
    if row and password == row[0]:
        token = generate_jwt(user_id)
        return jsonify({"token": token})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)