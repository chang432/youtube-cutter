# Currently not used because not needed

from flask import Flask
import flask_s3

root_path = ".."

app = Flask(__name__, template_folder=root_path+'/frontend/dist', static_folder=root_path+'/frontend/dist/assets')
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files-dev'
app.config['FLASKS3_ONLY_MODIFIED'] = True
app.config['FLASKS3_FORCE_MIMETYPE'] = True
app.config['FLASKS3_MIMETYPE_ALIASES'] = {
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/svg+xml': ['svg']
}
flask_s3.create_all(app)