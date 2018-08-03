from .base import BaseUpgradeScript


class RenameAllFilesScript(BaseUpgradeScript):

    __scriptname__ = 'rename_all_files.py'

    @staticmethod
    def upgrade():
        from os import rename, path
        import logging

        from ..config import config
        from ..models import ImportedFile

        for file in ImportedFile.query.all():  # type: ImportedFile
            try:
                old_name = path.join(config.ecq_working_dir, f"{file.id}.{file.extension}")
                new_name = path.join(config.ecq_working_dir, file.filename)
                rename(old_name, new_name)
            except:
                logging.getLogger(RenameAllFilesScript.__scriptname__).exception('error')
