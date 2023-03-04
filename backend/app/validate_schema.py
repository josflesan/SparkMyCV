import re
import json
import jsonschema

default_schema = """
[
    {
        "type": "div",
        "content": [
            "p": "Applicant Name",
            "p": "Applicant Email",
            "p": "Applicant Address",
            "p": "Applicant Phone Number",
        ]
    },
    {
        "type": "h1",
        "content": "Heading"
    },
    {
        "type": "div",
        "content": "This is some body text",
    },
    {
        "type": "h2",
        "content": "Skills"
    },
    {
        "type": "bullet",
        "content": ["Skill 1", "Skill 2"]
    }
]
"""

def validate_schema(schema: str = default_schema, data: str = default_schema):
    # Clean all whitespace in schema and data.
    schema = re.sub(r'\s+', '', schema)
    data = re.sub(r'\s+', '', data)

    schema_json = None
    data_json = None

    # Check if schema is valid JSON.
    try:
        schema_json = json.loads(schema)
    except json.decoder.JSONDecodeError:
        return False
    
    # Check if data is valid JSON.
    try:
        data_json = json.loads(data)
    except json.decoder.JSONDecodeError:
        return False
    
    # Check if data follows the schema.
    try:
        jsonschema.validate(data_json, schema_json)
    except jsonschema.exceptions.ValidationError:
        return False
    
    return True