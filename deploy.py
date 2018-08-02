from shutil import rmtree, copytree
from pathlib import Path
from os import path, unlink
from subprocess import run

cd = Path(path.dirname(__file__))

unlink('build.py')
rmtree(cd / 'src')
rmtree(cd / 'ecqemailmanager')
copytree(cd / 'dist/ecqemailmanager', cd / 'ecqemailmanager')
rmtree(cd / 'dist')

run(["python", "-m", "pipenv", "install"])
