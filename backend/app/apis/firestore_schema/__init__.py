## THIS FILE SERVES TO ILLUSTRATE THE STRUCTURE OF YOUR FIRESTORE DATABASE
## IN TEXT FORM. THIS WILL HELP THE AGENT UNDERSTAND HOW AND WHERE TO
## CREATE/READ/UPDATE/DELETE FILES FROM YOUR FIRESTORE DATABASE
## INSTRUCT THE AGENT TO RUN THIS TO GENERATE THE LATEST DATABASE SCHEMA
## THEN READ THE INTERNAL STORAGE FILES THAT ARE GENERATED USING THE GET METHOD.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import databutton as db
import json
import datetime
import time
from typing import Dict, Any, List, Optional

router = APIRouter()


class SchemaGenerationRequest(BaseModel):
    collections: Optional[List[str]] = None  # If provided, only analyze these collections
    depth: int = 3  # How deep to analyze nested subcollections
    sample_limit: int = 10  # Maximum number of documents to sample per collection


class SchemaGenerationResponse(BaseModel):
    status: str
    schema_data: Dict[str, Any]  # Renamed from 'schema' to avoid conflict with BaseModel.schema
    message: str


# Initialize Firebase Admin SDK if not already initialized
firebase_app = None
db_client = None


def get_firestore_client():
    global firebase_app, db_client

    if db_client is None:
        try:
            # Check if Firebase app is already initialized
            try:
                default_app = firebase_admin.get_app()
                # If we get here, the app is already initialized
                print("Using existing Firebase app")
                firebase_app = default_app
            except ValueError:
                # No app exists, initialize a new one
                # Get the Firebase service account JSON from secrets
                firebase_service_account = db.secrets.get("FIREBASE_SERVICE_ACCOUNT")

                # Convert JSON string to dict if it's a string
                if isinstance(firebase_service_account, str):
                    firebase_service_account = json.loads(firebase_service_account)

                # Initialize Firebase Admin SDK
                cred = credentials.Certificate(firebase_service_account)
                firebase_app = firebase_admin.initialize_app(cred)
                print("Firebase app initialized successfully")

            # Get Firestore client
            db_client = firestore.client()
            print("Firestore client initialized successfully")
        except Exception as e:
            print(f"Error initializing Firebase Admin SDK: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize Firebase: {str(e)}")

    return db_client


def infer_field_type(value: Any) -> str:
    """Infer the data type of a field value"""
    if value is None:
        return "null"
    elif isinstance(value, bool):
        return "boolean"
    elif isinstance(value, int):
        return "integer"
    elif isinstance(value, float):
        return "float"
    elif isinstance(value, str):
        return "string"
    elif isinstance(value, (datetime.datetime, datetime.date)):
        return "timestamp"
    elif isinstance(value, list):
        if value:
            # Try to infer type from the first element
            return f"array<{infer_field_type(value[0])}>"
        return "array"
    elif isinstance(value, dict):
        return "map"
    else:
        return f"unknown ({type(value).__name__})"


def analyze_document_schema(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a single document's schema"""
    schema = {}

    for field_name, field_value in doc_data.items():
        field_type = infer_field_type(field_value)

        # If it's a map, analyze its structure recursively
        if field_type == "map":
            schema[field_name] = {
                "type": field_type,
                "fields": analyze_document_schema(field_value),
            }
        else:
            schema[field_name] = {"type": field_type}

    return schema


def merge_schemas(schema1: Dict[str, Any], schema2: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two schemas, preserving all fields from both"""
    merged = schema1.copy()

    for field_name, field_info in schema2.items():
        if field_name not in merged:
            merged[field_name] = field_info
        elif field_info["type"] != merged[field_name]["type"]:
            # If types differ, mark as mixed type
            merged[field_name]["type"] = f"mixed({merged[field_name]['type']},{field_info['type']})"
        elif field_info["type"] == "map" and merged[field_name]["type"] == "map":
            # Recursively merge nested map schemas
            merged[field_name]["fields"] = merge_schemas(
                merged[field_name].get("fields", {}), field_info.get("fields", {})
            )

    return merged


async def analyze_collection(db, collection_path: str, sample_limit: int = 10) -> Dict[str, Any]:
    """Analyze a collection's schema by sampling documents"""
    print(f"Analyzing collection: {collection_path}")
    collection_ref = db.collection(collection_path)
    docs = collection_ref.limit(sample_limit).stream()

    merged_schema = {}
    doc_count = 0

    for doc in docs:
        doc_count += 1
        doc_data = doc.to_dict()
        doc_schema = analyze_document_schema(doc_data)

        if not merged_schema:
            merged_schema = doc_schema
        else:
            merged_schema = merge_schemas(merged_schema, doc_schema)

    return {"document_count_sampled": doc_count, "fields": merged_schema}


async def analyze_collections_recursive(db, collection_paths: List[str], depth: int = 3, sample_limit: int = 10):
    """Recursively analyze collections and their subcollections up to specified depth"""
    result = {}

    for collection_path in collection_paths:
        result[collection_path] = await analyze_collection(db, collection_path, sample_limit)

        # Stop recursion if we've reached maximum depth
        if depth <= 0:
            continue

        # Get subcollections
        collection_ref = db.collection(collection_path)
        docs = collection_ref.limit(sample_limit).stream()

        for doc in docs:
            subcollections = doc.reference.collections()
            subcollection_paths = []

            for subcollection in subcollections:
                subcollection_path = f"{collection_path}/{doc.id}/{subcollection.id}"
                subcollection_paths.append(subcollection_path)

            if subcollection_paths:
                # Recursively analyze subcollections with reduced depth
                subcollection_schemas = await analyze_collections_recursive(
                    db, subcollection_paths, depth - 1, sample_limit
                )
                result.update(subcollection_schemas)

    return result


@router.post("/generate-schema")
async def generate_schema(request: SchemaGenerationRequest) -> SchemaGenerationResponse:
    """Generate schema from Firestore collections"""
    try:
        firestore_db = get_firestore_client()

        # Get all top-level collections if not specified
        if not request.collections:
            all_collections = firestore_db.collections()
            collection_paths = [collection.id for collection in all_collections]
        else:
            collection_paths = request.collections

        # Analyze collections recursively
        schema = await analyze_collections_recursive(
            firestore_db, collection_paths, request.depth, request.sample_limit
        )

        # Add metadata
        result = {
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "collections_analyzed": len(schema),
                "depth": request.depth,
                "sample_limit": request.sample_limit,
                "timestamp": int(time.time()),
            },
            "collections": schema,
        }

        # Delete previous schema files
        all_json_files = db.storage.json.list()
        for file in all_json_files:
            if file.name.startswith("firestore-schema-"):
                print(f"Deleting previous schema file: {file.name}")
                db.storage.json.delete(file.name)

        # Create dynamic filename with timestamp
        schema_filename = f"firestore-schema-{int(time.time())}"

        # Save schema to storage using databutton db
        db.storage.json.put(schema_filename, result)

        # Generate Markdown structure diagram
        markdown_content = generate_structure_diagram(schema)

        # Structure diagram automatically overwrites previous version
        db.storage.text.put("firestore_structure_diagram", markdown_content)

        return SchemaGenerationResponse(
            status="success",
            schema_data=result,
            message=f"Successfully analyzed {len(schema)} collections and saved schema and diagram to storage",
        )

    except Exception as e:
        print(f"Error generating schema: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_structure_diagram(schema_data: Dict[str, Any]) -> str:
    """Generate a Markdown structure diagram from schema data"""
    markdown = '\n# Firestore Database Structure\n\n```\n{\n  "collections": {\n'

    # Add each collection
    for collection_name, collection_data in schema_data.items():
        markdown += f'    "{collection_name}": {{\n'
        markdown += '      "documents": [\n'
        markdown += '        "<document-id>": {\n'
        markdown += '          "fields": {\n'

        # Add fields for this collection
        fields = collection_data.get("fields", {})
        for field_name, field_info in fields.items():
            field_type = field_info.get("type", "unknown")
            markdown += f'            "{field_name}": "{field_type}",\n'

        # Remove trailing comma and close the structure
        if fields:
            markdown = markdown.rstrip(",\n") + "\n"

        markdown += "          }\n"
        markdown += "        }\n"
        markdown += "      ]\n"
        markdown += "    },\n"

    # Remove trailing comma and close the structure
    if schema_data:
        markdown = markdown.rstrip(",\n") + "\n"

    markdown += "  }\n}\n```\n\n"

    # Add detailed descriptions
    markdown += "## Collection Details\n\n"

    for collection_name, collection_data in schema_data.items():
        markdown += f"### {collection_name}\n"
        markdown += f"- **Purpose**: Stores data for {collection_name}\n"
        markdown += "- **Document ID**: Auto-generated or custom IDs\n"
        markdown += "- **Fields**:\n"

        fields = collection_data.get("fields", {})
        for field_name, field_info in fields.items():
            field_type = field_info.get("type", "unknown")
            markdown += f"  - `{field_name}`: {field_type.capitalize()} field\n"

        markdown += "\n"

    return markdown


@router.get("/get-structure-diagram")
async def get_structure_diagram() -> Dict[str, Any]:
    """Get the structure diagram from storage"""
    try:
        # Get the structure diagram
        diagram = db.storage.text.get("firestore_structure_diagram")

        return {"status": "success", "diagram": diagram}
    except Exception as e:
        return {
            "status": "error",
            "message": f"Could not retrieve structure diagram: {str(e)}",
            "diagram": None,
        }


@router.get("/get-schema")
async def get_schema() -> Dict[str, Any]:
    """Get the latest generated schema from storage"""
    try:
        # List all schema files
        all_json_files = db.storage.json.list()
        schema_files = [file.name for file in all_json_files if file.name.startswith("firestore-schema-")]

        # Sort by timestamp (newest first)
        schema_files.sort(reverse=True)

        if not schema_files:
            return {
                "status": "error",
                "message": "No schema files found",
                "schema": None,
            }

        # Get the latest schema
        latest_schema_file = schema_files[0]
        schema = db.storage.json.get(latest_schema_file)

        return {
            "status": "success",
            "schema": schema,
            "last_generated": schema.get("metadata", {}).get("generated_at"),
            "filename": latest_schema_file,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Could not retrieve schema: {str(e)}",
            "schema": None,
        }
