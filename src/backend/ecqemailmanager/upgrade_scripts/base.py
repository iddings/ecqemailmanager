
class BaseUpgradeScript:

    __scriptname__ = None

    @staticmethod
    def upgrade():
        raise NotImplementedError
