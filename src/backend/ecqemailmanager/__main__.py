import os
import sys
sys.path.extend([os.getcwd()])

from wsgiserver import WSGIServer

import ecqemailmanager.upgrade_scripts

from ecqemailmanager import app, config, db, scheduler
from ecqemailmanager.models import UpgradeScript
from ecqemailmanager.maintenance import schedule_maintenance

with app.app_context():
    db.create_all()
    base = ecqemailmanager.upgrade_scripts.BaseUpgradeScript
    for obj in ecqemailmanager.upgrade_scripts.__dict__.values():
        try:
            assert obj is not base
            assert issubclass(obj, base)
        except (AssertionError, TypeError):
            pass
        else:
            script_name = obj.__scriptname__
            if UpgradeScript.query.filter_by(file=obj.__scriptname__).first() is None:
                print(f"running upgrade script {script_name}")
                obj.upgrade()
                log = UpgradeScript(file=script_name)
                db.session.add(log)
                db.session.commit()

scheduler.start()
schedule_maintenance()

if config.development_mode:
    os.environ['FLASK_ENV'] = 'development'
    app.run(config.host, config.port)
else:
    WSGIServer(app, config.host, config.port).start()

