from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import databutton as db
import json
import re
from app.auth import AuthorizedUser

router = APIRouter()

# API Connection schemas
class ApiConnectionBase(BaseModel):
    name: str
    service: str
    description: Optional[str] = None

class ApiConnectionCreate(ApiConnectionBase):
    api_key: str

class ApiConnectionResponse(ApiConnectionBase):
    id: str
    status: str = "untested"  # untested, connected, failed
    last_tested: Optional[str] = None

class ApiConnectionUpdate(BaseModel):
    name: Optional[str] = None
    service: Optional[str] = None
    description: Optional[str] = None
    api_key: Optional[str] = None

class ApiConnectionTest(BaseModel):
    id: str

class ApiConnectionTestResponse(BaseModel):
    id: str
    status: str
    message: str

# Helper functions
def sanitize_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_connections() -> Dict:
    """Get stored API connections metadata"""
    try:
        connections = db.storage.json.get("api_connections_metadata", default={})
        return connections
    except Exception as e:
        print(f"Error getting connections: {str(e)}")
        return {}

def save_connections(connections: Dict) -> None:
    """Save API connections metadata"""
    try:
        db.storage.json.put("api_connections_metadata", connections)
    except Exception as e:
        print(f"Error saving connections: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save connections: {str(e)}")

def store_api_key(connection_id: str, api_key: str) -> None:
    """Store API key securely"""
    try:
        key_name = f"API_CONNECTION_{sanitize_key(connection_id)}"
        db.secrets.put(key_name, api_key)
    except Exception as e:
        print(f"Error storing API key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store API key: {str(e)}")

def get_api_key(connection_id: str) -> str:
    """Get API key securely"""
    try:
        key_name = f"API_CONNECTION_{sanitize_key(connection_id)}"
        return db.secrets.get(key_name)
    except Exception as e:
        print(f"Error getting API key: {str(e)}")
        return ""

# Endpoints
@router.get("/connections", response_model=List[ApiConnectionResponse])
async def list_connections(user: AuthorizedUser):
    """List all API connections"""
    try:
        connections = get_connections()
        return [ApiConnectionResponse(id=conn_id, **conn_data) for conn_id, conn_data in connections.items()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/connections", response_model=ApiConnectionResponse)
async def create_connection(connection: ApiConnectionCreate, user: AuthorizedUser):
    """Create a new API connection"""
    try:
        connections = get_connections()
        
        # Generate a unique ID
        connection_id = sanitize_key(f"{connection.service}_{len(connections) + 1}")
        
        # Store connection metadata
        connections[connection_id] = {
            "name": connection.name,
            "service": connection.service,
            "description": connection.description,
            "status": "untested",
            "last_tested": None
        }
        save_connections(connections)
        
        # Store API key securely
        store_api_key(connection_id, connection.api_key)
        
        return ApiConnectionResponse(id=connection_id, **connections[connection_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/connections/{connection_id}", response_model=ApiConnectionResponse)
async def get_connection(connection_id: str, user: AuthorizedUser):
    """Get API connection details"""
    try:
        connections = get_connections()
        if connection_id not in connections:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        return ApiConnectionResponse(id=connection_id, **connections[connection_id])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/connections/{connection_id}", response_model=ApiConnectionResponse)
async def update_connection(connection_id: str, connection: ApiConnectionUpdate, user: AuthorizedUser):
    """Update an API connection"""
    try:
        connections = get_connections()
        if connection_id not in connections:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        # Update connection metadata
        if connection.name is not None:
            connections[connection_id]["name"] = connection.name
        if connection.service is not None:
            connections[connection_id]["service"] = connection.service
        if connection.description is not None:
            connections[connection_id]["description"] = connection.description
        
        save_connections(connections)
        
        # Update API key if provided
        if connection.api_key is not None:
            store_api_key(connection_id, connection.api_key)
        
        return ApiConnectionResponse(id=connection_id, **connections[connection_id])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/connections/{connection_id}")
async def delete_connection(connection_id: str, user: AuthorizedUser):
    """Delete an API connection"""
    try:
        connections = get_connections()
        if connection_id not in connections:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        # Delete connection metadata
        del connections[connection_id]
        save_connections(connections)
        
        # Delete API key - Note: Databutton doesn't have a method to delete secrets,
        # so we'll just overwrite it with an empty string
        store_api_key(connection_id, "")
        
        return {"message": "Connection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/connections/test", response_model=ApiConnectionTestResponse)
async def test_connection(test_request: ApiConnectionTest, user: AuthorizedUser):
    """Test an API connection"""
    try:
        connection_id = test_request.id
        connections = get_connections()
        
        if connection_id not in connections:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        # Get the API key
        api_key = get_api_key(connection_id)
        if not api_key:
            return ApiConnectionTestResponse(
                id=connection_id,
                status="failed",
                message="API key not found or empty"
            )
        
        # Test connection based on service
        service = connections[connection_id]["service"]
        status = "connected"
        message = "Connection successful"
        
        # Implement service-specific connection tests
        if service == "vertex_ai":
            # Test Vertex AI connection
            import requests
            try:
                headers = {"Authorization": f"Bearer {api_key}"}
                response = requests.get(
                    "https://us-central1-aiplatform.googleapis.com/v1/projects",
                    headers=headers
                )
                if response.status_code != 200:
                    status = "failed"
                    message = f"Failed to connect to Vertex AI: {response.text}"
            except Exception as e:
                status = "failed"
                message = f"Error connecting to Vertex AI: {str(e)}"
        
        elif service == "openai":
            # Test OpenAI connection
            import openai
            try:
                client = openai.OpenAI(api_key=api_key)
                response = client.models.list()
                if not response:
                    status = "failed"
                    message = "Failed to connect to OpenAI API"
            except Exception as e:
                status = "failed"
                message = f"Error connecting to OpenAI: {str(e)}"
        
        elif service == "gemini":
            # Test Gemini API connection
            import requests
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                response = requests.get(url)
                if response.status_code != 200:
                    status = "failed"
                    message = f"Failed to connect to Gemini API: {response.text}"
            except Exception as e:
                status = "failed"
                message = f"Error connecting to Gemini API: {str(e)}"
        
        else:
            # Generic connection test (just verify the key is not empty)
            if not api_key:
                status = "failed"
                message = "API key is empty"
        
        # Update connection status
        from datetime import datetime
        connections[connection_id]["status"] = status
        connections[connection_id]["last_tested"] = datetime.now().isoformat()
        save_connections(connections)
        
        return ApiConnectionTestResponse(
            id=connection_id,
            status=status,
            message=message
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
