from .base import BaseUpgradeScript


class LowercaseAllEmailsScript(BaseUpgradeScript):

    __scriptname__ = 'lowercase_all_emails.py'

    @staticmethod
    def upgrade():
        from ..models import MacroEmailRecipient, db

        for recip in MacroEmailRecipient.query.all():  # type: MacroEmailRecipient
            recip.email = recip.email.lower()
            db.session.add(recip)
        db.session.commit()
