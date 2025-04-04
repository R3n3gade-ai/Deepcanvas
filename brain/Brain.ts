import {
  ApiConnectionCreate,
  ApiConnectionTest,
  ApiConnectionUpdate,
  ChatRequest,
  ChatWithGeminiData,
  ChatWithGeminiError,
  CheckHealthData,
  CreateConnectionData,
  CreateConnectionError,
  CreateWorkflowData,
  CreateWorkflowError,
  DeleteConnectionData,
  DeleteConnectionError,
  DeleteConnectionParams,
  DeleteWorkflowData,
  DeleteWorkflowError,
  DeleteWorkflowParams,
  ExecuteWorkflowData,
  ExecuteWorkflowError,
  GenerateSchemaData,
  GenerateSchemaError,
  GetConnectionData,
  GetConnectionError,
  GetConnectionParams,
  GetSchemaData,
  GetStructureDiagramData,
  GetWorkflowData,
  GetWorkflowError,
  GetWorkflowParams,
  ListConnectionsData,
  ListWorkflowsData,
  SchemaGenerationRequest,
  TestConnectionData,
  TestConnectionError,
  UpdateConnectionData,
  UpdateConnectionError,
  UpdateConnectionParams,
  UpdateWorkflowData,
  UpdateWorkflowError,
  UpdateWorkflowParams,
  WorkflowCreate,
  WorkflowExecuteInput,
  WorkflowUpdate,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate schema from Firestore collections
   *
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name generate_schema
   * @summary Generate Schema
   * @request POST:/routes/generate-schema
   */
  generate_schema = (data: SchemaGenerationRequest, params: RequestParams = {}) =>
    this.request<GenerateSchemaData, GenerateSchemaError>({
      path: `/routes/generate-schema`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the structure diagram from storage
   *
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name get_structure_diagram
   * @summary Get Structure Diagram
   * @request GET:/routes/get-structure-diagram
   */
  get_structure_diagram = (params: RequestParams = {}) =>
    this.request<GetStructureDiagramData, any>({
      path: `/routes/get-structure-diagram`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the latest generated schema from storage
   *
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name get_schema
   * @summary Get Schema
   * @request GET:/routes/get-schema
   */
  get_schema = (params: RequestParams = {}) =>
    this.request<GetSchemaData, any>({
      path: `/routes/get-schema`,
      method: "GET",
      ...params,
    });

  /**
   * @description Chat with the Gemini API. This endpoint forwards the request to Gemini API and returns the response.
   *
   * @tags dbtn/module:ai_chat, dbtn/hasAuth
   * @name chat_with_gemini
   * @summary Chat With Gemini
   * @request POST:/routes/chat
   */
  chat_with_gemini = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<ChatWithGeminiData, ChatWithGeminiError>({
      path: `/routes/chat`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all API connections
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name list_connections
   * @summary List Connections
   * @request GET:/routes/connections
   */
  list_connections = (params: RequestParams = {}) =>
    this.request<ListConnectionsData, any>({
      path: `/routes/connections`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new API connection
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name create_connection
   * @summary Create Connection
   * @request POST:/routes/connections
   */
  create_connection = (data: ApiConnectionCreate, params: RequestParams = {}) =>
    this.request<CreateConnectionData, CreateConnectionError>({
      path: `/routes/connections`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get API connection details
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name get_connection
   * @summary Get Connection
   * @request GET:/routes/connections/{connection_id}
   */
  get_connection = ({ connectionId, ...query }: GetConnectionParams, params: RequestParams = {}) =>
    this.request<GetConnectionData, GetConnectionError>({
      path: `/routes/connections/${connectionId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an API connection
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name update_connection
   * @summary Update Connection
   * @request PUT:/routes/connections/{connection_id}
   */
  update_connection = (
    { connectionId, ...query }: UpdateConnectionParams,
    data: ApiConnectionUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateConnectionData, UpdateConnectionError>({
      path: `/routes/connections/${connectionId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete an API connection
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name delete_connection
   * @summary Delete Connection
   * @request DELETE:/routes/connections/{connection_id}
   */
  delete_connection = ({ connectionId, ...query }: DeleteConnectionParams, params: RequestParams = {}) =>
    this.request<DeleteConnectionData, DeleteConnectionError>({
      path: `/routes/connections/${connectionId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Test an API connection
   *
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/connections/test
   */
  test_connection = (data: ApiConnectionTest, params: RequestParams = {}) =>
    this.request<TestConnectionData, TestConnectionError>({
      path: `/routes/connections/test`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all workflows for a user
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name list_workflows
   * @summary List Workflows
   * @request GET:/routes/workflows
   */
  list_workflows = (params: RequestParams = {}) =>
    this.request<ListWorkflowsData, any>({
      path: `/routes/workflows`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new workflow
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name create_workflow
   * @summary Create Workflow
   * @request POST:/routes/workflows
   */
  create_workflow = (data: WorkflowCreate, params: RequestParams = {}) =>
    this.request<CreateWorkflowData, CreateWorkflowError>({
      path: `/routes/workflows`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get workflow details
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name get_workflow
   * @summary Get Workflow
   * @request GET:/routes/workflows/{workflow_id}
   */
  get_workflow = ({ workflowId, ...query }: GetWorkflowParams, params: RequestParams = {}) =>
    this.request<GetWorkflowData, GetWorkflowError>({
      path: `/routes/workflows/${workflowId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a workflow
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name update_workflow
   * @summary Update Workflow
   * @request PUT:/routes/workflows/{workflow_id}
   */
  update_workflow = (
    { workflowId, ...query }: UpdateWorkflowParams,
    data: WorkflowUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateWorkflowData, UpdateWorkflowError>({
      path: `/routes/workflows/${workflowId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a workflow
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name delete_workflow
   * @summary Delete Workflow
   * @request DELETE:/routes/workflows/{workflow_id}
   */
  delete_workflow = ({ workflowId, ...query }: DeleteWorkflowParams, params: RequestParams = {}) =>
    this.request<DeleteWorkflowData, DeleteWorkflowError>({
      path: `/routes/workflows/${workflowId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Execute a workflow
   *
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name execute_workflow
   * @summary Execute Workflow
   * @request POST:/routes/workflows/execute
   */
  execute_workflow = (data: WorkflowExecuteInput, params: RequestParams = {}) =>
    this.request<ExecuteWorkflowData, ExecuteWorkflowError>({
      path: `/routes/workflows/execute`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
