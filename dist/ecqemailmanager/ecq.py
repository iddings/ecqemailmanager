import logging
import os
import subprocess

from traceback import print_exc

from .config import config
from .models import Macro, MacroTask

from threading import BoundedSemaphore


exec_lock = BoundedSemaphore(value=1)

log_file = os.path.join(config.ecq_temp_dir, 'log', 'scheduler.log')
log_dir = os.path.dirname(log_file)
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log = logging.getLogger(__name__)
handler = logging.FileHandler(log_file)
handler.setFormatter(logging.Formatter('[%(asctime)s]: %(message)s'))
log.addHandler(handler)
log.setLevel(logging.INFO)


def exec_macro(macro_id: int):
    try:
        log.info(f'[{macro_id}] schedule for macro triggered.')
        from ecqemailmanager import app
        with app.app_context():
            macro = Macro.query.filter_by(id=macro_id).first()
            if macro.enabled:
                with exec_lock:
                    log.info(f'[{macro_id}] execution lock acquired.')
                    with TempMacro(macro) as runner:
                        log.info(f'[{macro_id}] beginning execution')
                        runner.exec()
                    log.info(f'[{macro_id}] execution complete')
                    log.info(f'[{macro_id}] execution lock released')
            else:
                log.info(f'[{macro_id}] macro is disabled. skipping.')
    except:
        log.error(f'[{macro_id}] uncaught error executing macro.')


class TempMacro(object):

    _TMP_NAME_FMT = 'm-{id}'

    def __init__(self, macro: Macro):
        self.macro = macro
        self.macro_name = self._TMP_NAME_FMT.format(**self.macro.__dict__)
        macro_file = self.macro_name + ".mf"
        self.file = os.path.join(config.ecq_temp_dir, 'tmp', macro_file)
        file_dir = os.path.dirname(self.file)
        if not os.path.exists(file_dir):
            os.makedirs(file_dir)

    def __enter__(self):
        with open(self.file, 'w') as fp:
            fp.write(TempMacro.parse_macro(self.macro))
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def exec(self):
        cmd = [
            config.ecq_cqwr_exe,
            "/user:{}".format(config.ecq_username),
            "/password:{}".format(config.ecq_password),
            "/application:{}".format(config.ecq_application),
            "/noprogress",
            os.path.join(config.ecq_temp_dir, 'tmp', self.macro_name)
        ]
        subprocess.run(cmd, cwd=config.ecq_temp_dir)

    @staticmethod
    def parse_macro(macro: Macro):

        lines = [config.ecq_macro_header]
        attachments = []

        for task in macro.tasks:  # type: MacroTask
            report_file_full_path = os.path.join(config.ecq_temp_dir, task.report_file.filename)
            line = "run"
            if task.has_output:
                filename = task.formatted_output_filename()
                line += f'/{task.format}="{filename}"'
                attachments.append(f"{filename}.{TempMacro.get_format_extension(task.format)}")
            line += f" {report_file_full_path}"
            lines.append(line)

        attachment_clause = ' '.join([
            f'/attach-binary:"{os.path.join(config.ecq_user_dir, config.ecq_username, a)}"'
            for a in attachments
        ])

        email_line = (f'cli cqcsmail -subject:"{macro.email_subject}" '
                      f'-text:"{macro.email_text}" {attachment_clause} '
                      f'{" ".join(macro.email_addresses)}')

        lines.append(email_line)

        return "\n".join(lines)

    @staticmethod
    def get_format_extension(format: str) -> str:
        if format == 'xls':
            return 'xlsx'
        return format
