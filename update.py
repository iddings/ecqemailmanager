from subprocess import run

run([r"C:\Program Files\Git\git-bash.exe", "-c", "git fetch --all && git reset --hard origin/master"])

with open("deploy.py") as fp:
    exec(fp.read())
