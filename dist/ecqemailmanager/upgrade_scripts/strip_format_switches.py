from .base import BaseUpgradeScript


class StripFormatSwitchesScript(BaseUpgradeScript):
    __scriptname__ = 'strip_format_switches.py'

    @staticmethod
    def upgrade():
        from os import path
        from shutil import copy2

        from ..config import config
        from ..models import ImportedFile

        for file in ImportedFile.query.all():  # type: ImportedFile
            rp_path = path.join(config.ecq_working_dir, file.filename)
            copy2(rp_path, rp_path + '.bak')
            file.strip_format_switches()
