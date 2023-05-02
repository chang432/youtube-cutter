from flask import Flask

app = Flask(__name__)

@app.route('/api/')
def hello_world():
    return 'Hello, World!'

def lambda_handler(event, context):
    # Create an instance of the Flask app
    if not app:
        app = Flask(__name__)

    # Route the incoming event to the Flask app
    response = app(event)

    # Convert the Flask response to a format that Lambda expects
    return {
        'statusCode': response.status_code,
        'body': response.get_data(),
        'headers': dict(response.headers)
    }