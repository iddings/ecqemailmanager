from argparse import ArgumentParser
from json import load
from os import environ
from re import findall

from dataclasses import dataclass


@dataclass
class _Config:

    # !!! IMPORTANT !!!
    # Ensure the initials for these variables are unique
    # (i.e. the initials for secret_key are sk)
    # Otherwise commandline arguments will break
    # !!!!!!!!!!!!!!!!!

    # server config
    host: str = '0.0.0.0'
    port: int = 8080
    development_mode: bool = False
    secret_key: str = None

    # maintenance config
    clean_directories_time: str = "00:00"

    # database config
    database_uri: str = None

    # ldap config
    ldap_uri: str = None
    ldap_security_group: str = 'Reporting Administrators'

    # ecq config
    ecq_application: str = None
    ecq_working_dir: str = None
    ecq_cqwr_exe: str = None
    ecq_username: str = None
    ecq_password: str = None
    ecq_user_dir: str = None
    ecq_execution_timeout: int = 600
    ecq_execution_max_retries: int = 1
    ecq_concurrent_executions: int = 2


config = _Config()


def _parse_cli_args():
    parser = ArgumentParser()
    parser.add_argument('-c', '--config')
    for arg, typ in _Config.__annotations__.items():
        opts = {"type": typ}
        if typ is bool:
            opts = {"action": "store_true", "default": None}
        short_code = f"-{''.join(findall(r'_([A-z])', f'_{arg}'))}"
        if short_code == '-h':
            short_code = f'{short_code}{arg[1]}'
        long_code = f"--{arg.replace('_', '-')}"
        parser.add_argument(short_code, long_code, **opts)
    args, _ = parser.parse_known_args()
    return args.__dict__


def _parse_config_file(config_file: str):
    with open(config_file) as fp:
        return load(fp)


def _parse_env_vars():
    return {
        k: environ[k.upper()] for k in config.__dict__
        if k.upper() in environ
    }


def _filter_opts(opts):
    return {k: v for k, v in opts.items() if v is not None}


def init_config():
    pre_parser = ArgumentParser()
    pre_parser.add_argument('-c', '--config-file')
    args, _ = pre_parser.parse_known_args()

    cli_opts = _parse_cli_args()
    file_opts = _parse_config_file(args.config_file) if args.config_file else {}
    env_opts = _parse_env_vars()

    # precedence order: cli, file, env
    config_dict = _filter_opts(env_opts)
    config_dict.update(_filter_opts(file_opts))
    config_dict.update(_filter_opts(cli_opts))

    for k, v in config_dict.items():
        if k in config.__dict__:
            setattr(config, k, v)
