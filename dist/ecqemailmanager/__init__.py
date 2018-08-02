from datetime import datetime, timedelta
from os import environ, path, unlink, scandir, DirEntry
from time import strptime
from typing import List

from apscheduler.triggers.cron import CronTrigger
from flask import Flask, send_from_directory
from sqlalchemy import not_

from .config import config, init_config
init_config()

from .api import api, jwt
from .aps import scheduler
from .models import db, ImportedFile

app = Flask(__name__, static_folder=environ.get('STATIC_DIR', 'static'))


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = config.database_uri
app.config['SECRET_KEY'] = config.secret_key

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


def purge_unused_reports():

    with app.app_context():
        unused: List[ImportedFile] = ImportedFile.query.filter(not_(ImportedFile.tasks.any())).all()
        for f in unused:
            unlink(path.join(config.ecq_temp_dir, f.filename))
            db.session.delete(f)
        db.session.commit()

    keep_cutoff = datetime.now() - timedelta(days=3)

    with scandir(path.join(config.ecq_user_dir, config.ecq_username)) as it:
        for entry in it:  # type: DirEntry
            if datetime.fromtimestamp(entry.stat().st_mtime) < keep_cutoff:
                unlink(entry.path)


PURGE_REPORT_JOB_ID = 'PURGE_UNUSED_REPORTS'


purge_time = strptime(config.purge_unused_report_time, '%H:%M')
scheduler.add_job(
    purge_unused_reports,
    id=PURGE_REPORT_JOB_ID,
    trigger=CronTrigger(hour=purge_time.tm_hour, minute=purge_time.tm_min),
    replace_existing=True
)
