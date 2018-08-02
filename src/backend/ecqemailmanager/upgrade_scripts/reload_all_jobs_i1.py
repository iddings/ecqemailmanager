from .base import BaseUpgradeScript


class ReloadAllJobsI1Script(BaseUpgradeScript):

    __scriptname__ = 'reload_all_jobs_i1.py'

    @staticmethod
    def upgrade():
        from ..models import Macro

        for macro in Macro.query.all():
            macro.schedule = macro.schedule
