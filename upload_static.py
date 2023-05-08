from flask import Flask
import flask_s3
app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files'
app.config['FLASKS3_ONLY_MODIFIED'] = True
app.config['FLASKS3_FORCE_MIMETYPE'] = True
app.config['FLASKS3_MIMETYPE_ALIASES'] = {
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/svg+xml': ['svg']
}
flask_s3.create_all(app)