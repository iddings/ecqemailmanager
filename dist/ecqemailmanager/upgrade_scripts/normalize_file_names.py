from .base import BaseUpgradeScript


class NormalizeFileNamesScript(BaseUpgradeScript):

    __scriptname__ = 'normalize_file_names.py~r4'

    @staticmethod
    def upgrade():
        from os import rename, path, scandir
        import logging

        from ..config import config
        from ..models import ImportedFile

        with scandir(config.ecq_working_dir) as it:
            current_files = [e.path for e in it if e.is_file()]

        log = logging.getLogger(NormalizeFileNamesScript.__scriptname__)

        for file in ImportedFile.query.all():  # type: ImportedFile
            try:
                for c_file in current_files:
                    if file.id in c_file:
                        old_name = c_file
                        new_name = path.join(config.ecq_working_dir, file.filename)
                        if old_name.endswith('.cqf'):
                            new_name = new_name[:-2] + 'cqf'
                        if old_name != new_name:
                            rename(old_name, new_name)
                            log.info(f'renamed {old_name} to {new_name}')
            except:
                log.exception('error')
