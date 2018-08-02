from flask_marshmallow import Marshmallow

from .models import Macro, MacroTask, ImportedFile

mm = Marshmallow()


class _ImportedFileSchema(mm.ModelSchema):

    id = mm.String()
    source_user = mm.String()
    source_file = mm.String()


class _TaskSchema(mm.ModelSchema):

    #report_file = mm.String()

    class Meta:
        model = MacroTask
        exclude = (
            'macro', 'file'
        )


class _MacroSchema(mm.ModelSchema):

    email_addresses = mm.List(mm.String())
    tasks = mm.List(mm.Nested(_TaskSchema))
    schedule = mm.Dict()

    class Meta:
        model = Macro
        exclude = (
            '_email_addresses',
        )


class _Schemas:
    imported_file = _ImportedFileSchema()
    macro = _MacroSchema()
    task = _TaskSchema()


schemas = _Schemas()
