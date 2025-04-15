import requests
from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS

API_KEY = ""
API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-3B"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

app = Flask(__name__)
CORS(app)
analyzer = SentimentIntensityAnalyzer()
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
    """API endpoint for chatbot with distress detection"""
    data = request.json
    user_message = data.get("message", "")
    
    if not user_message:
        return jsonify({"response": "Please enter a valid message."})
    
    distress_score = analyze_sentiment(user_message)
    
    if distress_score >= 80:
        return jsonify({
            "response": "I'm really sorry that you are feeling this way. You are not alone. "
                        "Please consider reaching out to a professional for support.",
            "help_resource": "https://www.mentalhealth.gov/get-help/immediate-help",  
            "distress_score": distress_score
        })
    
    chatbot_response = chat_with_llama(user_message)
    return jsonify({
        "response": chatbot_response,
        "distress_score": distress_score
    })
if __name__ == "__main__":
    app.run(debug=True)