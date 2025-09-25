from cohere import Client
from dotenv import load_dotenv
from os import getenv
from flask import Flask, jsonify, request, Response, send_from_directory
from flask_cors import CORS

load_dotenv()
api_key = getenv("COHERE_API_KEY")
temp = float(getenv("TEMPERATURE"))
co = Client(api_key)
app = Flask(__name__)
CORS(app)

@app.route('/')
def index() -> Response:
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/generate', methods=['GET'])
def generate() -> Response:
    prompt = request.args.get('prompt', '')
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    response = co.chat(
        model='command-a-03-2025',
        message=prompt,
        max_tokens=300,
        temperature=temp
    )

    text = response.text.strip()\
                        .replace('—', '-').replace('“', '"').replace('”', '"')\
                        .replace('‘', "'").replace('’', "'").replace('**', '')
                        
    response.text = text
    
    return jsonify({"response": response.text,}), 200
    
    
app.run(host='localhost', port=5000, debug=True)
