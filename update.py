from subprocess import run

run([r"C:\Program Files\Git\git-bash.exe", "-c", "git fetch --all && git reset --hard origin/master"])
run(["python", "-m", "pipenv", "run", "python", "deploy.py"])
