from .base import BaseUpgradeScript


class RemoveOldMaintenanceJobScript(BaseUpgradeScript):

    __scriptname__ = 'remove_old_maintenance_job.py'

    @staticmethod
    def upgrade():

        from ..aps import scheduler
        from apscheduler.jobstores.base import JobLookupError

        try:
            scheduler.remove_job('PURGE_UNUSED_REPORTS')
        except JobLookupError:
            pass
