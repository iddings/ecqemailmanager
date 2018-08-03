from datetime import datetime, timedelta
from os import unlink, scandir, DirEntry, path, rename
from time import strptime
from typing import List

from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import not_

from .aps import scheduler
from .config import config
from .models import ImportedFile, db


def exec_maintenance():

    from . import app
    from .ecq import exec_lock

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

    with exec_lock:
        with scandir(path.join(config.ecq_working_dir, 'tmp')) as it:
            for entry in it:  # type: DirEntry
                unlink(entry.path)


def roll_log_file():

    from . import log_file_name, log_file_suffix, log_dir

    yesterday = (datetime.now().today() - timedelta(days=1)).strftime('%Y_%m_%d')

    rename(
        log_file_name + log_file_suffix,
        log_file_name + yesterday + log_file_suffix
    )

    keep_cutoff = datetime.now() - timedelta(days=15)

    with scandir(log_dir) as it:
        for entry in it:  # type: DirEntry
            if datetime.fromtimestamp(entry.stat().st_mtime) < keep_cutoff:
                unlink(entry.path)


def schedule_maintenance():

    scheduler.add_job(
        roll_log_file,
        id='MAINT_MANAGE_LOGS',
        trigger=CronTrigger(hour=0, minute=0),
        replace_existing=True
    )

    sched_time = strptime(config.clean_directories_time, '%H:%M')
    scheduler.add_job(
        exec_maintenance,
        id='MAINT_CLEAN_DIRS',
        trigger=CronTrigger(hour=sched_time.tm_hour, minute=sched_time.tm_min),
        replace_existing=True
    )
