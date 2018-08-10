import logging

from logging import handlers
from os import environ, path, makedirs

from flask import Flask, send_from_directory

from .config import config, init_config
init_config()

from .api import api, jwt
from .aps import scheduler
from .models import db, ImportedFile

app = Flask(__name__, static_folder=environ.get('STATIC_DIR', 'static'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = config.database_uri
app.config['SECRET_KEY'] = config.secret_key
app.config['JWT_BLACKLIST_ENABLED'] = True


db.init_app(app)

from .schemas import mm
mm.init_app(app)

app.register_blueprint(api)

jwt.init_app(app)


@app.route('/')
@app.route('/r')
@app.route('/r/')
@app.route('/r/<report>')
@app.route('/r/<report>/')
@app.route('/r/<report>/<section>')
@app.route('/r/<report>/<section>/')
def index(report=None, section=None):
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def asset(path):
    return send_from_directory(app.static_folder, path)


log_file_name = path.join(config.ecq_working_dir, 'log', 'scheduler')
log_file_suffix = '.log'
log_dir = path.dirname(log_file_name + log_file_suffix)
if not path.exists(log_dir):
    makedirs(log_dir)

root_logger = logging.root
handler = handlers.TimedRotatingFileHandler(
    log_file_name + log_file_suffix,
    when='midnight',
    backupCount=14
)
handler.setFormatter(logging.Formatter('[%(asctime)s] (%(name)s): %(message)s'))
root_logger.addHandler(handler)
root_logger.setLevel(logging.INFO)
