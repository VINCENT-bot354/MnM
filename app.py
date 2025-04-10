import os
import json
import logging
from flask import Flask, render_template, current_app

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")

# Helper function to load pricing data
def get_pricing_data():
    pricing_file = os.path.join(current_app.static_folder, 'data', 'pricing.json')
    with open(pricing_file, 'r') as f:
        return json.load(f)

@app.route('/')
def index():
    """Render the homepage"""
    return render_template('index.html')

@app.route('/quotes')
def quotes():
    """Render the quote calculator page"""
    return render_template('quotes.html')

@app.route('/services')
def services():
    """Render the services page"""
    pricing = get_pricing_data()
    return render_template('services.html', pricing=pricing)

@app.route('/blog')
def blog():
    """Render the blog page"""
    return render_template('blog.html')

@app.route('/contact')
def contact():
    """Render the contact page"""
    return render_template('contact.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
