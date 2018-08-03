import logging

from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.schedulers.background import BackgroundScheduler

from .config import config

scheduler = BackgroundScheduler(
    jobstores=dict(
        default=SQLAlchemyJobStore(url=config.database_uri)
    ),
    executors=dict(
        default=ThreadPoolExecutor(max_workers=20)
    ),
    job_defaults=dict(
        misfire_grace_time=15*60
    )
)

logging.getLogger('apscheduler').setLevel(logging.INFO)
