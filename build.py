from os import chdir, path
from pathlib import PurePath
from shutil import rmtree, copytree
from subprocess import run, PIPE

print(
"""
What should be built? Make a selection:
1. Whole App
2. Frontend Only
"""
)

selection = input("Choice (1-2) [1]: ")

try:
    selection = int(selection)
except ValueError:
    selection = 1

CWD = PurePath(path.dirname(__file__))

DIST_PATH = CWD / 'dist'
SRC_PATH = CWD / 'src'

if selection == 2:
    print("Building frontend...")
    chdir(str(SRC_PATH / 'frontend/ecqemailmanager'))

    run(
        [
            'node', str(SRC_PATH / 'frontend/ecqemailmanager/node_modules/@angular/cli/bin/ng'), 'build',
            '--prod', '--aot', '--no-progress'
        ]
        , stdout=PIPE
    )

    chdir(CWD)
    print("Done.")

out_path = DIST_PATH / "ecqemailmanager"

if selection == 1:

    print("Bundling backend...")
    if path.exists(out_path):
        rmtree(out_path)
    copytree(SRC_PATH / 'backend/ecqemailmanager', out_path)

    print("Done.")

print("Copying compiled assets to dist folder...")
static_path = out_path / 'static'
if path.exists(static_path):
    rmtree(static_path)
copytree(SRC_PATH / 'frontend/ecqemailmanager/dist/ecqemailmanager', static_path)

print("Done.")

print("Build complete.")
