import re
import json
import jsonschema
from genson import SchemaBuilder

default_schema = """
[
    {
        "type": "div",
        "content": ["p1", "p2", "p3", "p4"]
    },
    {
        "type": "h1",
        "content": "Heading"
    },
    {
        "type": "div",
        "content": "This is some body text"
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
    schema_json_schema = None

    # Check if schema is valid JSON.
    try:
        schema_json = json.loads(schema)
    except json.decoder.JSONDecodeError:
        print("Schema is not valid schema.")
        return False
    
    # Check if schema is valid JSON schema.
    try:
        schema = SchemaBuilder()
        schema.add_object(schema_json)
        schema_json_schema = schema.to_schema()
    except jsonschema.exceptions.SchemaError:
        print("Schema is not valid JSON schema.")
        return False
    
    # Check if data is valid JSON.
    try:
        data_json = json.loads(data)
    except json.decoder.JSONDecodeError:
        return False
    
    # Check if data follows the schema.
    try:
        jsonschema.validate(data_json, schema_json_schema)
    except jsonschema.exceptions.ValidationError:
        return False
    
    return True