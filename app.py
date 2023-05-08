from flask import Flask, render_template, redirect
from flask_s3 import FlaskS3
#, static_folder='frontend/dist/assets'
app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files'
s3 = FlaskS3(app)

@app.route('/hello/<name>')
def say_hello(name):
    print(f"hellooo {name}")
    return f'Hello, {name}!'

@app.route('/')
def serve():
    return render_template('index.html')

