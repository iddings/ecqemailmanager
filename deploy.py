from shutil import rmtree, copytree
from pathlib import Path
from os import path, unlink
from subprocess import run

cd = Path(path.dirname(__file__))

run([r"C:\Program Files\Git\git-bash.exe", "-c", "git fetch --all && git reset --hard origin/master"])

unlink('build.py')
rmtree(cd / 'src')
rmtree(cd / 'ecqemailmanager')
copytree(cd / 'dist/ecqemailmanager', cd / 'ecqemailmanager')
rmtree(cd / 'dist')

run(["python", "-m", "pipenv", "install"])
