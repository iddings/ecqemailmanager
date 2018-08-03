from datetime import datetime
from os import path, sep
from re import sub
from shutil import copy2
from typing import List, TypeVar
from uuid import uuid4

from apscheduler.triggers.cron import CronTrigger
from flask_sqlalchemy import SQLAlchemy

from .aps import scheduler
from .config import config


db = SQLAlchemy()


class MacroEmailRecipient(db.Model):

    __tablename__ = 'macro_email'

    macro_id = db.Column(db.Integer, db.ForeignKey("macro.id"), primary_key=True)
    email = db.Column(db.String, primary_key=True)

    macro: 'Macro'


class Macro(db.Model):

    __tablename__ = 'macro'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String)
    email_subject = db.Column(db.String)
    email_text = db.Column(db.String, default='This is an automatically generated report. Please do not reply.')
    enabled = db.Column(db.Boolean, default=True)
    _email_addresses = db.relationship(MacroEmailRecipient, backref='macro')
    tasks = db.relationship('MacroTask', backref='macro', order_by='MacroTask.task_seq')

    @property
    def email_addresses(self):
        return [e.email for e in self._email_addresses]

    @email_addresses.setter
    def email_addresses(self, addresses: List[str]):
        new_set = set(
            MacroEmailRecipient.query.filter_by(email=e, macro=self).first()
            or MacroEmailRecipient(macro=self, email=e)
            for e in map(lambda e: e.lower(), addresses)
        )

        current_set = set(self._email_addresses)

        db.session.add_all(new_set - current_set)
        for email in current_set - new_set:
            db.session.delete(email)

    @property
    def schedule(self):
        try:
            return {
                f.name: str(f)
                for f in scheduler.get_job(str(self.id)).trigger.fields
                if f.name in ('day', 'day_of_week', 'hour', 'minute')
            }
        except Exception:
            return {}

    @schedule.setter
    def schedule(self, field_dict: dict):
        from .ecq import exec_macro

        if field_dict:
            try:
                scheduler.add_job(
                    exec_macro,
                    id=str(self.id),
                    args=(self.id,),
                    trigger=CronTrigger(**field_dict),
                    replace_existing=True
                )
            except TypeError:
                pass

    def organize_tasks(self):
        for index, task in enumerate(self.tasks):
            task.task_seq = index + 1


class ImportedFile(db.Model):

    __tablename__ = 'imported_file'

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid4()))
    extension = db.Column(db.String)
    source_user = db.Column(db.String)
    source_file = db.Column(db.String)

    tasks = db.relationship('MacroTask', backref='report_file')

    @property
    def filename(self):

        # noinspection PyTypeChecker
        source_file = sub(r'[/\\]', '_', self.source_file).replace(' ', '-')
        return f"{self.source_user}~{source_file}~{self.id}.{self.extension}"

    @property
    def display_name(self):
        return f"{self.source_user}: {self.source_file}"

    @staticmethod
    def import_file(user: str, file: str) -> 'ImportedFile':

        extension = file[-2:]

        imported = ImportedFile(source_user=user, source_file=file, extension=extension)
        db.session.add(imported)
        db.session.commit()
        imported.copy_file_from_source()

        return imported

    def copy_file_from_source(self):
        src_path = path.join(config.ecq_user_dir, self.source_user, self.source_file)
        dst_path = path.join(config.ecq_working_dir, self.filename)
        copy2(src_path, dst_path)
        self.strip_format_switches()
        format_file = f"{src_path[:-3]}.cqf"
        if path.exists(format_file):
            format_dst = path.join(config.ecq_working_dir, f"{self.id}.cqf")
            copy2(format_file, format_dst)

    def strip_format_switches(self):
        pattern = '/(wks|wk1|dif|html|xls|qdb|csv|pdf|xml|output)(=([\'"]).*?\\3)?'
        with open(path.join(config.ecq_working_dir, self.filename), 'r+') as fp:
            lines = [
                sub(pattern, '', line)
                for line in fp
            ]
            fp.seek(0)
            fp.truncate(0)
            fp.writelines(lines)


class MacroTask(db.Model):

    __tablename__ = 'macro_task'

    macro_id = db.Column(db.Integer, db.ForeignKey(Macro.id), primary_key=True)
    task_seq = db.Column(db.Integer, primary_key=True)
    format = db.Column(db.String)
    _report_file_id = db.Column('report_file', db.String, db.ForeignKey(ImportedFile.id))
    output_file = db.Column(db.String)
    report_file: ImportedFile

    @property
    def has_output(self) -> bool:
        return bool(self.format and self.output_file)

    def formatted_output_filename(self):
        return f"{self.output_file}_{self.task_seq}~{datetime.now().strftime('%Y%m%d-%H%M')}"


class RevokedToken(db.Model):

    __tablename__ = 'revoked_token'
    
    token = db.Column(db.String, primary_key=True)
    date_expires = db.Column(db.DateTime, nullable=False)
    date_revoked = db.Column(db.DateTime, nullable=False, default=datetime.now)
    type = db.Column(db.String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": type
    }


class RevokedAccessToken(RevokedToken):

    TYPE = "access"

    __mapper_args__ = {
        "polymorphic_identity": TYPE
    }


class RevokedRefreshToken(RevokedToken):

    TYPE = "refresh"

    __mapper_args__ = {
        "polymorphic_identity": TYPE
    }


class UpgradeScript(db.Model):

    __tablename__ = 'upgrade_script'

    file = db.Column(db.String, primary_key=True)
