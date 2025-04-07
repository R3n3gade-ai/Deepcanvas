"""Workflow API endpoints for managing and executing workflows."""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import databutton as db

# Create router
router = APIRouter(prefix="/workflows")

# Models
class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any] = Field(default_factory=dict)
    
class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    type: Optional[str] = None
    animated: Optional[bool] = None
    style: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)
    createdBy: Optional[str] = None
    createdAt: str
    updatedAt: Optional[str] = None

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[WorkflowNode]] = None
    edges: Optional[List[WorkflowEdge]] = None

class WorkflowExecuteInput(BaseModel):
    workflowId: str
    inputs: Optional[Dict[str, Any]] = None

class NodeExecutionResult(BaseModel):
    status: str  # 'success', 'error', 'skipped'
    execution_time: Optional[float] = None
    output: Optional[Any] = None
    error: Optional[str] = None

class WorkflowExecutionResult(BaseModel):
    success: bool
    execution_time: float
    node_results: Dict[str, NodeExecutionResult] = Field(default_factory=dict)
    overall_metrics: Optional[Dict[str, Any]] = None

# Storage keys
WORKFLOWS_KEY = "workflows"

# Helper functions
def get_workflows() -> List[Workflow]:
    """Get all workflows from storage."""
    try:
        workflows_json = db.storage.json.get(WORKFLOWS_KEY)
        if workflows_json:
            return [Workflow(**w) for w in workflows_json]
        return []
    except:
        return []

def save_workflows(workflows: List[Workflow]):
    """Save workflows to storage."""
    workflows_json = [w.dict() for w in workflows]
    db.storage.json.put(WORKFLOWS_KEY, workflows_json)

# API Endpoints
@router.get("")
async def list_workflows() -> List[Workflow]:
    """List all workflows."""
    return get_workflows()

@router.post("")
async def create_workflow(workflow_data: WorkflowCreate) -> Workflow:
    """Create a new workflow."""
    workflows = get_workflows()
    
    # Create new workflow
    now = datetime.now().isoformat()
    new_workflow = Workflow(
        id=str(uuid.uuid4()),
        name=workflow_data.name,
        description=workflow_data.description,
        nodes=workflow_data.nodes,
        edges=workflow_data.edges,
        createdAt=now,
        updatedAt=now
    )
    
    # Add to list and save
    workflows.append(new_workflow)
    save_workflows(workflows)
    
    return new_workflow

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str) -> Workflow:
    """Get a workflow by ID."""
    workflows = get_workflows()
    for workflow in workflows:
        if workflow.id == workflow_id:
            return workflow
    
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow_data: WorkflowUpdate) -> Workflow:
    """Update a workflow."""
    workflows = get_workflows()
    
    # Find workflow to update
    for i, workflow in enumerate(workflows):
        if workflow.id == workflow_id:
            # Update fields
            if workflow_data.name is not None:
                workflow.name = workflow_data.name
            if workflow_data.description is not None:
                workflow.description = workflow_data.description
            if workflow_data.nodes is not None:
                workflow.nodes = workflow_data.nodes
            if workflow_data.edges is not None:
                workflow.edges = workflow_data.edges
            
            # Update timestamp
            workflow.updatedAt = datetime.now().isoformat()
            
            # Save and return
            workflows[i] = workflow
            save_workflows(workflows)
            return workflow
    
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    """Delete a workflow."""
    workflows = get_workflows()
    
    # Find and remove workflow
    for i, workflow in enumerate(workflows):
        if workflow.id == workflow_id:
            workflows.pop(i)
            save_workflows(workflows)
            return {"status": "success", "message": "Workflow deleted"}
    
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.post("/execute")
async def execute_workflow(execution_data: WorkflowExecuteInput) -> WorkflowExecutionResult:
    """Execute a workflow."""
    workflows = get_workflows()
    
    # Find workflow to execute
    workflow = None
    for w in workflows:
        if w.id == execution_data.workflowId:
            workflow = w
            break
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Simple mock execution for now
    import time
    import random
    
    start_time = time.time()
    
    # Process nodes in a simple way (this would be more complex in a real implementation)
    node_results = {}
    for node in workflow.nodes:
        # Simulate processing time
        node_start = time.time()
        time.sleep(random.uniform(0.1, 0.5))
        node_time = time.time() - node_start
        
        # 90% chance of success for demo purposes
        if random.random() < 0.9:
            # Success case
            output = None
            if node.type == "input":
                output = execution_data.inputs or {"default": "Sample input data"}
            elif node.type == "output":
                # Find connected nodes
                input_edges = [e for e in workflow.edges if e.target == node.id]
                if input_edges:
                    # Get output from source node
                    source_node_id = input_edges[0].source
                    if source_node_id in node_results:
                        output = node_results[source_node_id].output
                    else:
                        output = {"result": "No input data"}
                else:
                    output = {"result": "No input connection"}
            elif node.type == "llm":
                output = {"text": "This is a simulated LLM response for demonstration purposes."}
            elif node.type == "transform":
                output = {"transformed": "Sample transformed data"}
            else:
                output = {"result": f"Processed by {node.type} node"}
            
            node_results[node.id] = NodeExecutionResult(
                status="success",
                execution_time=node_time,
                output=output
            )
        else:
            # Error case for demonstration
            node_results[node.id] = NodeExecutionResult(
                status="error",
                execution_time=node_time,
                error=f"Simulated error in {node.type} node"
            )
    
    # Calculate overall metrics
    total_time = time.time() - start_time
    success_count = sum(1 for r in node_results.values() if r.status == "success")
    total_nodes = len(node_results)
    success_rate = (success_count / total_nodes) * 100 if total_nodes > 0 else 0
    
    # Return execution results
    return WorkflowExecutionResult(
        success=all(r.status == "success" for r in node_results.values()),
        execution_time=total_time,
        node_results=node_results,
        overall_metrics={
            "success_rate": success_rate,
            "total_execution_time": total_time,
            "nodes_processed": total_nodes
        }
    )
