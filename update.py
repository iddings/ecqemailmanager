from shutil import rmtree, copytree
from pathlib import Path
from os import path
from subprocess import run

cd = Path(path.dirname(__file__))

run([r"C:\Program Files\Git\git-bash.exe", "-c", "git pull"])

rmtree(cd / 'src')
copytree(cd / 'dist/ecqemailmanager', cd)
rmtree(cd / 'dist')
