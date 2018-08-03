from .base import BaseUpgradeScript


class RenameAllFormatFilesScript(BaseUpgradeScript):

    __scriptname__ = 'rename_all_format_files.py'

    @staticmethod
    def upgrade():
        from os import rename, path
        import logging

        from ..config import config
        from ..models import ImportedFile

        for file in ImportedFile.query.all():  # type: ImportedFile
            old_name = path.join(config.ecq_working_dir, f"{file.id}.cf")
            if path.exists(old_name):
                try:
                    new_name = path.join(config.ecq_working_dir, file.filename[:-2] + 'cf')
                    rename(old_name, new_name)
                except:
                    logging.getLogger(RenameAllFormatFilesScript.__scriptname__).exception('error')
