from shutil import rmtree, copytree
from pathlib import Path
from os import path, unlink

cd = Path(path.dirname(__file__))

unlink('build.py')
rmtree(cd / 'src')
rmtree(cd / 'ecqemailmanager')
copytree(cd / 'dist/ecqemailmanager', cd / 'ecqemailmanager')
rmtree(cd / 'dist')
if path.exists(cd / 'ecqemailmanager/__pycache__'):
    rmtree(cd / 'ecqemailmanager/__pycache__')
