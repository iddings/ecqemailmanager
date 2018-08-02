from shutil import rmtree, copytree
from pathlib import Path
from os import path

cd = Path(path.dirname(__file__))

rmtree(cd / 'src')
copytree(cd / 'dist', cd)
rmtree(cd / 'dist')
