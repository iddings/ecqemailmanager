from .base import BaseUpgradeScript


class ReimportAllReportsScript(BaseUpgradeScript):
    __scriptname__ = 'reimport_all_reports.py'

    @staticmethod
    def upgrade():
        from ..models import ImportedFile

        for file in ImportedFile.query.all():  # type: ImportedFile
            try:
                file.copy_file_from_source()
            except:
                print(f'error on report {file.source_user}/{file.source_file}')
