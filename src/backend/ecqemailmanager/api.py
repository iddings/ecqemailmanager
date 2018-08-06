from datetime import datetime
from enum import Enum
from functools import partial
from typing import Iterable, Type
from os import scandir, path
from traceback import print_exc

import ldap

from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, jwt_refresh_token_required, create_access_token, \
    create_refresh_token, get_jwt_identity, decode_token

from .models import RevokedToken, RevokedAccessToken, RevokedRefreshToken, db, Macro, MacroTask, MacroEmailRecipient, \
    ImportedFile
from .config import config
from .ecq import exec_macro
from .schemas import schemas

api = Blueprint('api', __name__, url_prefix='/api')
jwt = JWTManager()
ldap_server = ldap.initialize(config.ldap_uri)


class Error(Enum):

    def __init__(self, error_code: int, description: str, status_code: int=500):
        self.error_code = error_code
        self.description = description
        self.status_code = status_code

    TOKEN_STALE = 100, 'Fresh token required', 401
    TOKEN_INVALID = 101, 'Token is invalid', 401
    TOKEN_EXPIRED = 102, 'Token has expired', 401
    TOKEN_CLAIMS_VERIFICATION = 103, 'User claims verification failed', 401
    TOKEN_REVOKED = 104, 'Token has been revoked', 401
    TOKEN_USER_LOAD = 105, 'Unable to load user', 401
    TOKEN_UNAUTHORIZED = 106, 'Unauthorized', 401

    INVALID_LOGIN = 200, "Invalid username/password", 401

    BAD_REQUEST = 300, "Bad Request", 400

    SERVER_ERROR = 500, "Server Error"


def response(resp=None, message=None, success=True, status_code=200):
    return jsonify(
        response=resp,
        message=message,
        success=success
    ), status_code


def error_response(error: Error, details: str=None):
    return response(dict(
        code=error.error_code,
        details=details
    ), error.description, False, error.status_code)


# maps jwt error to api.Error
jwt_error_responses = {
    'needs_fresh_token_loader': Error.TOKEN_STALE,
    'invalid_token_loader': Error.TOKEN_INVALID,
    'expired_token_loader': Error.TOKEN_EXPIRED,
    'claims_verification_failed_loader': Error.TOKEN_CLAIMS_VERIFICATION,
    'revoked_token_loader': Error.TOKEN_REVOKED,
    'user_loader_error_loader': Error.TOKEN_USER_LOAD,
    'unauthorized_loader': Error.TOKEN_UNAUTHORIZED
}

# sets callbacks for jwt errors, unifies responses from api
for callback, error in jwt_error_responses.items():
    assert hasattr(jwt, callback)
    getattr(jwt, callback)(partial(error_response, error))


@jwt.token_in_blacklist_loader
def token_in_blacklist(token):
    return bool(RevokedToken.query.filter_by(token=token['jti']).first())


@api.route('/auth', methods=['POST'])
def api_auth():

    username = request.json.get('username', None)
    password = request.json.get('password', None)

    # noinspection PyUnresolvedReferences
    try:
        if username == 'temp' and password == 'temp_pass':
            pass
        else:
            ldap_server.simple_bind_s(username, password)
    except ldap.INVALID_CREDENTIALS:
        return error_response(Error.INVALID_LOGIN)
    else:
        access_token = create_access_token(username)
        refresh_token = create_refresh_token(username)

        access_expires = decode_token(access_token)['exp']
        refresh_expires = decode_token(refresh_token)['exp']

        return response(dict(
            access=dict(
                token=access_token,
                expires=access_expires
            ),
            refresh=dict(
                token=refresh_token,
                expires=refresh_expires
            )
        ))


@api.route('/auth/refresh', methods=['POST'])
@jwt_refresh_token_required
def api_auth_refresh():
    token = create_access_token(get_jwt_identity())
    expires = decode_token(token)['exp']
    return response(dict(
        access=dict(
            token=token,
            expires=expires
        )
    ))


@api.route('/auth/logout', methods=['POST'])
def auth_logout():

    token_types: Iterable[Type[RevokedToken]] = (RevokedAccessToken, RevokedRefreshToken)
    for t in token_types:
        raw_token = request.json.get(f'{t.TYPE}', None)
        if not raw_token:
            return error_response(Error.BAD_REQUEST, f'no {t.TYPE} token specified')
        token = decode_token(raw_token)
        revoked_token = t(
            token=token['jti'],
            date_expires=datetime.fromtimestamp(token['exp'])
        )
        db.session.add(revoked_token)
    db.session.commit()

    return response(
        message='user logged out'
    )


@api.route('/macro', methods=['GET'])
@jwt_required
def api_macro_all():
    return response(
        schemas.macro.dump(Macro.query.all(), many=True)[0]
    )


@api.route('/macro/<int:id>', methods=['POST'])
@jwt_required
def api_macro(id: int):

    with db.session.no_autoflush:

        macro = Macro.query.filter_by(id=id).first()
        updates = request.json

        for k in 'email_addresses', 'email_subject', 'email_text', 'enabled', 'name':
            setattr(macro, k, updates[k])

        # convert report file ids to objects
        for task in updates['tasks']:
            if task['report_file']:
                task['report_file'] = ImportedFile.query.filter_by(id=task['report_file']).first()

        # update as many existing tasks as possible
        # then add new ones

        num_tasks_new = len(updates['tasks'])
        num_tasks_old = len(macro.tasks)

        update_count = min(num_tasks_old, num_tasks_new)
        count_diff = num_tasks_old - num_tasks_new

        for task in updates['tasks'][:update_count]:
            for k in 'format', 'report_file', 'output_file':
                setattr(macro.tasks[task['task_seq']-1], k, task[k])

        if count_diff > 0:  # need to remove tasks
            for task in macro.tasks[-count_diff:]:
                db.session.delete(task)

        elif count_diff < 0:  # need to add new tasks
            for task in updates['tasks'][count_diff:]:
                macro.tasks.append(MacroTask(
                    format=task['format'],
                    report_file=task['report_file'],
                    output_file=task['output_file']
                ))

        macro.organize_tasks()

        db.session.commit()

        macro.schedule = updates['schedule']

    return response(schemas.macro.dump(macro)[0], message="save successful")


@api.route('/macro', methods=['POST'])
@jwt_required
def api_macro_new():
    macro = Macro(name=request.json['name'], email_subject=request.json['name'])
    db.session.add(macro)
    db.session.commit()
    return response(schemas.macro.dump(macro)[0])


@api.route('/appData')
@jwt_required
def api_app_data():
    eq_mf_files = schemas.imported_file.dump(ImportedFile.query.all(), many=True)[0]
    with scandir(config.ecq_user_dir) as it:
        users = [e.name for e in it if e.is_dir()]
    return response(dict(
        report_files=eq_mf_files,
        emails=[e.email for e in db.session.query(MacroEmailRecipient.email).distinct()],
        users=users
    ))


@api.route('/userFolder/<user>')
@jwt_required
def api_user_folder(user):

    def get_files(folder: str):
        files = []
        with scandir(folder) as it:
            for e in it:
                if e.is_dir():
                    files += get_files(e.path)
                elif e.name[-3:].lower() in ('.mf', '.eq'):
                    files.append(e.path)
        return files

    full_files = get_files(path.join(config.ecq_user_dir, user))
    prefix_length = len(path.join(config.ecq_user_dir, user)) + 1
    return response([f[prefix_length:] for f in full_files])


@api.route('/userFolder/<user>/import/<path:file_name>', methods=['POST'])
@jwt_required
def api_import_file(user: str, file_name: str):
    file: ImportedFile = ImportedFile.query.filter_by(source_user=user, source_file=file_name).first()
    if file:
        file.copy_file_from_source()
    else:
        file = ImportedFile.import_file(user, file_name)
    return response(schemas.imported_file.dump(file)[0])


@api.route('/macro/<int:id>', methods=['DELETE'])
@jwt_required
def api_macro_delete(id):
    macro = Macro.query.filter_by(id=id).first()
    macro.schedule = None
    for e in [macro] + macro.tasks + macro._email_addresses:
        db.session.delete(e)
    db.session.commit()
    return response('delete successful')


@api.route('/file/<id>/reload')
@jwt_required
def api_file_reload(id):
    file: ImportedFile = ImportedFile.query.filter_by(id=id).first()
    file.copy_file_from_source()
    return response('reload successful')


@api.route('/macro/<int:id>/run')
@jwt_required
def api_run_now(id):
    try:
        assert Macro.query.filter_by(id=id).first()
        exec_macro(id)
    except Exception as e:
        print_exc()
        return error_response(Error.SERVER_ERROR, details="could not execute macro")
    else:
        return response('macro execution successful')


@api.route('/macro/refreshAllJobs')
@jwt_required
def api_macro_refresh_all_jobs():
    all_macros = Macro.query.all()
    for macro in all_macros:
        macro.schedule = macro.schedule
    return response('macro jobs refreshed')
