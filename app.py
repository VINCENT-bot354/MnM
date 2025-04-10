import os
import logging
from flask import Flask, render_template

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")

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
    return render_template('services.html')

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
