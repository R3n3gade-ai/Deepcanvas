"""API Connections endpoints for managing external API integrations."""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import databutton as db

# Create router
router = APIRouter(prefix="/connections")

# Models
class ApiConnectionCreate(BaseModel):
    name: str
    type: str  # e.g., 'rest', 'graphql', 'oauth2', etc.
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    
class ApiConnectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ApiConnection(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    createdBy: Optional[str] = None
    createdAt: str
    updatedAt: Optional[str] = None

class ApiConnectionTest(BaseModel):
    type: str
    config: Dict[str, Any]
    testParams: Optional[Dict[str, Any]] = None

class TestResult(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Storage keys
CONNECTIONS_KEY = "api_connections"

# Helper functions
def get_connections() -> List[ApiConnection]:
    """Get all API connections from storage."""
    try:
        connections_json = db.storage.json.get(CONNECTIONS_KEY)
        if connections_json:
            return [ApiConnection(**c) for c in connections_json]
        return []
    except:
        return []

def save_connections(connections: List[ApiConnection]):
    """Save API connections to storage."""
    connections_json = [c.dict() for c in connections]
    db.storage.json.put(CONNECTIONS_KEY, connections_json)

# API Endpoints
@router.get("")
async def list_connections() -> List[ApiConnection]:
    """List all API connections."""
    return get_connections()

@router.post("")
async def create_connection(connection_data: ApiConnectionCreate) -> ApiConnection:
    """Create a new API connection."""
    connections = get_connections()
    
    # Create new connection
    now = datetime.now().isoformat()
    new_connection = ApiConnection(
        id=str(uuid.uuid4()),
        name=connection_data.name,
        type=connection_data.type,
        description=connection_data.description,
        config=connection_data.config,
        createdAt=now,
        updatedAt=now
    )
    
    # Add to list and save
    connections.append(new_connection)
    save_connections(connections)
    
    return new_connection

@router.get("/{connection_id}")
async def get_connection(connection_id: str) -> ApiConnection:
    """Get an API connection by ID."""
    connections = get_connections()
    for connection in connections:
        if connection.id == connection_id:
            return connection
    
    raise HTTPException(status_code=404, detail="API connection not found")

@router.put("/{connection_id}")
async def update_connection(connection_id: str, connection_data: ApiConnectionUpdate) -> ApiConnection:
    """Update an API connection."""
    connections = get_connections()
    
    # Find connection to update
    for i, connection in enumerate(connections):
        if connection.id == connection_id:
            # Update fields
            if connection_data.name is not None:
                connection.name = connection_data.name
            if connection_data.description is not None:
                connection.description = connection_data.description
            if connection_data.config is not None:
                connection.config = connection_data.config
            
            # Update timestamp
            connection.updatedAt = datetime.now().isoformat()
            
            # Save and return
            connections[i] = connection
            save_connections(connections)
            return connection
    
    raise HTTPException(status_code=404, detail="API connection not found")

@router.delete("/{connection_id}")
async def delete_connection(connection_id: str) -> Dict[str, str]:
    """Delete an API connection."""
    connections = get_connections()
    
    # Find and remove connection
    for i, connection in enumerate(connections):
        if connection.id == connection_id:
            connections.pop(i)
            save_connections(connections)
            return {"status": "success", "message": "API connection deleted"}
    
    raise HTTPException(status_code=404, detail="API connection not found")

@router.post("/test")
async def test_connection(test_data: ApiConnectionTest) -> TestResult:
    """Test an API connection."""
    # This is a simplified implementation that just returns success
    # In a real implementation, you would actually test the connection
    
    # Simulate different responses based on connection type
    if test_data.type == "rest":
        return TestResult(
            success=True,
            message="REST API connection test successful",
            data={"status": 200, "response_time": 0.5}
        )
    elif test_data.type == "graphql":
        return TestResult(
            success=True,
            message="GraphQL API connection test successful",
            data={"status": 200, "response_time": 0.3}
        )
    elif test_data.type == "oauth2":
        return TestResult(
            success=True,
            message="OAuth2 connection test successful",
            data={"token_received": True}
        )
    else:
        # Generic success response
        return TestResult(
            success=True,
            message=f"{test_data.type} connection test successful",
            data={"status": "ok"}
        )
