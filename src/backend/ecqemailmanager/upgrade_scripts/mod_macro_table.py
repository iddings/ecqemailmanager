from .base import BaseUpgradeScript


class ModMacroTableScript(BaseUpgradeScript):

    __scriptname__ = 'mod_macro_table.py'

    @staticmethod
    def upgrade():
        from sqlalchemy import text
        from ..models import db

        cmds = [
            """CREATE TABLE macro31ff
            (
                id INTEGER PRIMARY KEY NOT NULL,
                name VARCHAR,
                email_subject VARCHAR,
                email_text VARCHAR,
                enabled TINYINT
            );""",
            
            """INSERT INTO macro31ff(id, name, email_subject, email_text, enabled)
              SELECT id, name, email_subject, email_text, 1 FROM macro;""",
            
            "DROP TABLE macro;",

            "ALTER TABLE macro31ff RENAME TO macro;"

        ]

        for cmd in cmds:
           db.engine.execute(text(cmd))
