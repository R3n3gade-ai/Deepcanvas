from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import databutton as db
import json
import re
from datetime import datetime
from app.auth import AuthorizedUser
from random import randint

router = APIRouter()

# Models for workflow nodes and edges (using ReactFlow terminology)
class WorkflowNodeData(BaseModel):
    label: Optional[str] = None
    type: Optional[str] = None
    inputs: Optional[List[Dict[str, Any]]] = None
    outputs: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        extra = "allow"  # Allow additional fields for node-specific properties

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: WorkflowNodeData = Field(default_factory=WorkflowNodeData)

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: Optional[str] = None
    createdBy: Optional[str] = None

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
    input: Dict[str, Any] = Field(default_factory=dict)

class WorkflowExecuteResult(BaseModel):
    executionId: str
    status: str  # 'completed', 'failed', 'in_progress'
    output: Optional[Dict[str, Any]] = None
    errors: Optional[Dict[str, str]] = None
    startTime: str = Field(default_factory=lambda: datetime.now().isoformat())
    endTime: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    nodeResults: Optional[Dict[str, Any]] = None

# Helper functions
def sanitize_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_workflows(user_id: str) -> Dict[str, Workflow]:
    """Get stored workflows for a user"""
    try:
        storage_key = f"workflows_{sanitize_key(user_id)}"
        workflows = db.storage.json.get(storage_key, default={})
        return workflows
    except Exception as e:
        print(f"Error getting workflows: {str(e)}")
        return {}

def save_workflows(user_id: str, workflows: Dict[str, Workflow]) -> None:
    """Save workflows for a user"""
    try:
        storage_key = f"workflows_{sanitize_key(user_id)}"
        db.storage.json.put(storage_key, workflows)
    except Exception as e:
        print(f"Error saving workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save workflows: {str(e)}")

# Endpoints
@router.get("/workflows", response_model=List[Workflow])
async def list_workflows(user: AuthorizedUser):
    """List all workflows for a user"""
    try:
        workflows = get_workflows(user.sub)
        return list(workflows.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows", response_model=Workflow)
async def create_workflow(workflow: WorkflowCreate, user: AuthorizedUser):
    """Create a new workflow"""
    try:
        workflows = get_workflows(user.sub)
        
        # Generate a unique ID
        workflow_id = f"wf_{len(workflows) + 1}_{int(datetime.now().timestamp())}"
        
        # Create workflow object
        new_workflow = Workflow(
            id=workflow_id,
            name=workflow.name,
            description=workflow.description,
            nodes=workflow.nodes,
            edges=workflow.edges,
            createdAt=datetime.now().isoformat(),
            updatedAt=datetime.now().isoformat(),
            createdBy=user.sub
        )
        
        # Store workflow
        workflows[workflow_id] = new_workflow.dict()
        save_workflows(user.sub, workflows)
        
        return new_workflow
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str, user: AuthorizedUser):
    """Get workflow details"""
    try:
        workflows = get_workflows(user.sub)
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return Workflow(**workflows[workflow_id])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow: WorkflowUpdate, user: AuthorizedUser):
    """Update a workflow"""
    try:
        workflows = get_workflows(user.sub)
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        current_workflow = Workflow(**workflows[workflow_id])
        
        # Update fields if provided
        update_data = workflow.dict(exclude_unset=True)
        updated_workflow = current_workflow.copy(update=update_data)
        updated_workflow.updatedAt = datetime.now().isoformat()
        
        # Store updated workflow
        workflows[workflow_id] = updated_workflow.dict()
        save_workflows(user.sub, workflows)
        
        return updated_workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, user: AuthorizedUser):
    """Delete a workflow"""
    try:
        workflows = get_workflows(user.sub)
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Delete workflow
        del workflows[workflow_id]
        save_workflows(user.sub, workflows)
        
        return {"message": "Workflow deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflows/execute", response_model=WorkflowExecuteResult)
async def execute_workflow(execute_input: WorkflowExecuteInput, user: AuthorizedUser):
    """Execute a workflow"""
    try:
        workflow_id = execute_input.workflowId
        input_data = execute_input.input
        
        # Get the workflow
        workflows = get_workflows(user.sub)
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow = Workflow(**workflows[workflow_id])
        
        # Generate an execution ID
        execution_id = f"exec_{workflow_id}_{int(datetime.now().timestamp())}"
        start_time = datetime.now()
        
        # Initialize execution context with input data
        context = {"input": input_data, "variables": {}}
        
        # Build a graph of nodes for execution
        nodes_by_id = {node.id: node for node in workflow.nodes}
        edges_by_source = {}
        for edge in workflow.edges:
            if edge.source not in edges_by_source:
                edges_by_source[edge.source] = []
            edges_by_source[edge.source].append(edge)
        
        # Find start nodes (nodes with no incoming edges)
        target_nodes = set(edge.target for edge in workflow.edges)
        start_nodes = [node for node in workflow.nodes if node.id not in target_nodes]
        
        # Function to get children of a node
        def get_next_nodes(node_id):
            return [nodes_by_id[edge.target] for edge in edges_by_source.get(node_id, [])] 
        
        # Mock node execution
        node_results = {}
        total_execution_time = 0
        
        # Process nodes (simulated)
        def process_node(node):
            node_type = node.type.lower()
            node_label = node.data.label or f"Node {node.id}"
            
            # Simulate different processing based on node type
            execution_time = randint(50, 500)  # Random execution time between 50-500ms
            total_execution_time = execution_time
            
            result = {
                "id": node.id,
                "status": "completed",
                "executionTime": execution_time,
                "output": None,
                "error": None
            }
            
            try:
                # Process node based on specific type and settings
                if node_type == "input":
                    # Input node passes the workflow input to its output
                    result["output"] = {"data": input_data}
                
                elif node_type == "output":
                    # Output node collects final data
                    result["output"] = {"result": "Final output collected"}
                
                elif node_type == "llm":
                    # LLM node - simulate text generation based on configured model and prompt
                    model = node.data.model or "gpt-4o-mini"
                    prompt = node.data.prompt or "Default system prompt"
                    temperature = node.data.temperature or 0.7
                    
                    # Simulate different responses based on the model
                    if "gpt-4" in model:
                        response_quality = "detailed and nuanced"
                    elif "gemini" in model:
                        response_quality = "comprehensive and analytical"
                    elif "claude" in model:
                        response_quality = "thoughtful and clear"
                    else:
                        response_quality = "helpful and informative"
                    
                    # Simulate how temperature affects response
                    if temperature < 0.3:
                        variability = "very consistent and conservative"
                    elif temperature < 0.7:
                        variability = "balanced and reliable"
                    else:
                        variability = "creative and diverse"
                    
                    result["output"] = {
                        "text": f"[{model}] Generated a {response_quality} response that is {variability}.\n\nBased on prompt: {prompt[:100]}{'...' if len(prompt) > 100 else ''}",
                        "model": model,
                        "settings": {
                            "temperature": temperature,
                            "prompt_length": len(prompt)
                        },
                        "usage": {"prompt_tokens": len(prompt) // 4, "completion_tokens": randint(80, 250)}
                    }
                
                elif node_type == "api" or node_type == "http":
                    # API/HTTP node - simulate API call based on URL and method
                    url = node.data.url or "https://api.example.com/endpoint"
                    method = node.data.method or "GET"
                    headers = node.data.headers or {}
                    
                    # Simulate different responses based on method and URL
                    domain = url.split("/")[2] if "//" in url and "/" in url.split("//")[1] else "example.com"
                    
                    result["output"] = {
                        "request": {
                            "url": url,
                            "method": method,
                            "headers": headers
                        },
                        "response": {
                            "status": 200,
                            "headers": {"content-type": "application/json"},
                            "data": {
                                "message": f"Simulated {method} response from {domain}",
                                "timestamp": datetime.now().isoformat(),
                                "requestId": f"req_{randint(100000, 999999)}"
                            }
                        }
                    }
                
                elif node_type == "database":
                    # Database node - simulate query execution
                    query = node.data.query or "SELECT * FROM data;"
                    parameters = node.data.parameters or []
                    
                    # Generate mock results based on the query type
                    if query.lower().startswith("select"):
                        # Simulate a SELECT query with random results
                        row_count = randint(2, 10)
                        mock_data = [
                            {f"column_{i}": f"value_{j}_{i}" for i in range(1, 4)} 
                            for j in range(row_count)
                        ]
                        result["output"] = {
                            "query": query,
                            "rowCount": row_count,
                            "data": mock_data
                        }
                    elif any(query.lower().startswith(x) for x in ["insert", "update", "delete"]):
                        # Simulate a write query
                        affected_rows = randint(1, 5)
                        result["output"] = {
                            "query": query,
                            "affectedRows": affected_rows,
                            "success": True
                        }
                    else:
                        # Other query types
                        result["output"] = {
                            "query": query,
                            "executed": True,
                            "message": "Query executed successfully"
                        }
                
                elif node_type == "transform":
                    # Transform node - simulate data transformation
                    transform_code = node.data.transformCode or "// Transform logic here"
                    
                    result["output"] = {
                        "transformedData": {
                            "description": "Data transformed using custom logic",
                            "code": transform_code[:50] + ("..." if len(transform_code) > 50 else ""),
                            "timestamp": datetime.now().isoformat()
                        },
                        "samplesProcessed": randint(5, 100)
                    }
                
                elif node_type == "filter":
                    # Filter node - simulate data filtering
                    filter_condition = node.data.filterCondition or "// Filter condition here"
                    
                    # Simulate filtering results
                    total_items = randint(10, 50)
                    passed_items = randint(0, total_items)
                    
                    result["output"] = {
                        "filter": {
                            "condition": filter_condition[:50] + ("..." if len(filter_condition) > 50 else ""),
                            "totalItems": total_items,
                            "passedItems": passed_items,
                            "filteredItems": total_items - passed_items
                        }
                    }
                
                elif node_type == "code":
                    # Code node - simulate custom code execution
                    code = node.data.code or "// Custom code here"
                    
                    result["output"] = {
                        "execution": {
                            "code": code[:50] + ("..." if len(code) > 50 else ""),
                            "result": "Custom code executed successfully",
                            "executionTime": f"{randint(5, 100)} ms"
                        }
                    }
                
                elif node_type == "switch":
                    # Switch node - simulate conditional branch
                    condition = node.data.condition or "// Condition expression"
                    # Randomly choose a branch for simulation
                    branch = "true" if randint(0, 1) == 1 else "false"
                    
                    result["output"] = {
                        "condition": condition[:50] + ("..." if len(condition) > 50 else ""),
                        "evaluated": branch == "true",
                        "branch": branch
                    }
                
                elif node_type == "loop":
                    # Loop node - simulate iteration
                    loop_type = node.data.loopType or "foreach"
                    iterations = randint(3, 15)
                    
                    if loop_type == "foreach":
                        result["output"] = {
                            "type": "foreach",
                            "iterations": iterations,
                            "completed": True,
                            "itemsProcessed": iterations
                        }
                    else:  # while loop
                        while_condition = node.data.whileCondition or "// While condition"
                        result["output"] = {
                            "type": "while",
                            "condition": while_condition[:50] + ("..." if len(while_condition) > 50 else ""),
                            "iterations": iterations,
                            "completed": True
                        }
                
                elif node_type == "embedding":
                    # Embedding node - simulate vector embedding generation
                    model = node.data.model or "text-embedding-ada-002"
                    vector_size = 768 if "small" in model else 1536 if "large" in model else 1024
                    
                    # Generate a tiny sample of the vector for display
                    sample_vector = [round(randint(-100, 100) / 100, 2) for _ in range(4)]
                    
                    result["output"] = {
                        "model": model,
                        "dimensions": vector_size,
                        "vector": f"[{', '.join(map(str, sample_vector))}, ...]",
                        "normalized": True
                    }
                
                else:
                    # Generic node processing for unspecified types
                    result["output"] = {
                        "processed": f"Data processed by {node_type} node",
                        "timestamp": datetime.now().isoformat()
                    }
                
                # 10% chance of random failure for testing error handling
                if randint(1, 10) == 1 and node_type not in ["input", "output"]:
                    raise Exception(f"Random failure in {node_type} node: operation could not complete")
                
            except Exception as e:
                result["status"] = "failed"
                result["error"] = str(e)
            
            return result
        
        # Simulate processing all nodes
        for node in workflow.nodes:
            node_results[node.id] = process_node(node)
            
        # Calculate metrics
        total_nodes = len(workflow.nodes)
        completed_nodes = sum(1 for result in node_results.values() if result["status"] == "completed")
        failed_nodes = total_nodes - completed_nodes
        
        # Check overall status
        status = "completed" if failed_nodes == 0 else "failed"
        
        # Mock final output from last node (typically output node)
        final_output = {
            "result": "Workflow executed successfully",
            "processedNodes": total_nodes,
            "nodeOutputs": {}
        }
        
        # Add sample outputs from certain node types to the final result
        for node in workflow.nodes:
            node_result = node_results.get(node.id, {})
            if node_result.get("status") == "completed" and node.type.lower() in ["output", "llm"]:
                final_output["nodeOutputs"][node.id] = node_result.get("output")
        
        end_time = datetime.now()
        execution_duration = (end_time - start_time).total_seconds() * 1000  # in ms
        
        result = WorkflowExecuteResult(
            executionId=execution_id,
            status=status,
            output=final_output,
            nodeResults=node_results,
            metrics={
                "executionTime": f"{execution_duration:.2f} ms",
                "totalNodes": total_nodes,
                "completedNodes": completed_nodes,
                "failedNodes": failed_nodes,
                "successRate": f"{(completed_nodes / total_nodes) * 100:.1f}%" if total_nodes > 0 else "N/A"
            },
            endTime=end_time.isoformat()
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        # Return error result
        execution_id = f"exec_error_{int(datetime.now().timestamp())}"
        end_time = datetime.now().isoformat()
        return WorkflowExecuteResult(
            executionId=execution_id,
            status="failed",
            errors={"message": str(e)},
            nodeResults={},
            metrics={"error": "Execution failed"},
            endTime=end_time
        )
