from .base import BaseUpgradeScript


class ImportOldFilesScript(BaseUpgradeScript):

    __scriptname__ = 'import_old_files'

    @staticmethod
    def upgrade():
        from os import scandir, sep, rename, path

        from ..config import config
        from ..models import MacroTask, ImportedFile, db

        with scandir(config.ecq_working_dir) as it:
            for e in filter(lambda e: e.is_file(), it):
                if ImportedFile.query.filter_by(id=e.name[:-3]).first() is not None:
                    continue

                user, file = e.name.split("_", 1)
                file = file.replace("~", sep)
                extension = file[-2:]
                file = ImportedFile(source_user=user, source_file=file, extension=extension)
                db.session.add(file)
                db.session.commit()

                new_name = path.join(config.ecq_working_dir, file.filename)
                rename(e.path, new_name)

                for task in MacroTask.query.filter_by(report_file=e.name).all():
                    task.report_file = file.id
                    db.session.add(task)

                db.session.commit()
