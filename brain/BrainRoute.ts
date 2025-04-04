import {
  ApiConnectionCreate,
  ApiConnectionTest,
  ApiConnectionUpdate,
  ChatRequest,
  ChatWithGeminiData,
  CheckHealthData,
  CreateConnectionData,
  CreateWorkflowData,
  DeleteConnectionData,
  DeleteWorkflowData,
  ExecuteWorkflowData,
  GenerateSchemaData,
  GetConnectionData,
  GetSchemaData,
  GetStructureDiagramData,
  GetWorkflowData,
  ListConnectionsData,
  ListWorkflowsData,
  SchemaGenerationRequest,
  TestConnectionData,
  UpdateConnectionData,
  UpdateWorkflowData,
  WorkflowCreate,
  WorkflowExecuteInput,
  WorkflowUpdate,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Generate schema from Firestore collections
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name generate_schema
   * @summary Generate Schema
   * @request POST:/routes/generate-schema
   */
  export namespace generate_schema {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SchemaGenerationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateSchemaData;
  }

  /**
   * @description Get the structure diagram from storage
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name get_structure_diagram
   * @summary Get Structure Diagram
   * @request GET:/routes/get-structure-diagram
   */
  export namespace get_structure_diagram {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStructureDiagramData;
  }

  /**
   * @description Get the latest generated schema from storage
   * @tags dbtn/module:firestore_schema, dbtn/hasAuth
   * @name get_schema
   * @summary Get Schema
   * @request GET:/routes/get-schema
   */
  export namespace get_schema {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSchemaData;
  }

  /**
   * @description Chat with the Gemini API. This endpoint forwards the request to Gemini API and returns the response.
   * @tags dbtn/module:ai_chat, dbtn/hasAuth
   * @name chat_with_gemini
   * @summary Chat With Gemini
   * @request POST:/routes/chat
   */
  export namespace chat_with_gemini {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ChatWithGeminiData;
  }

  /**
   * @description List all API connections
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name list_connections
   * @summary List Connections
   * @request GET:/routes/connections
   */
  export namespace list_connections {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListConnectionsData;
  }

  /**
   * @description Create a new API connection
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name create_connection
   * @summary Create Connection
   * @request POST:/routes/connections
   */
  export namespace create_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ApiConnectionCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateConnectionData;
  }

  /**
   * @description Get API connection details
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name get_connection
   * @summary Get Connection
   * @request GET:/routes/connections/{connection_id}
   */
  export namespace get_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetConnectionData;
  }

  /**
   * @description Update an API connection
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name update_connection
   * @summary Update Connection
   * @request PUT:/routes/connections/{connection_id}
   */
  export namespace update_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ApiConnectionUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateConnectionData;
  }

  /**
   * @description Delete an API connection
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name delete_connection
   * @summary Delete Connection
   * @request DELETE:/routes/connections/{connection_id}
   */
  export namespace delete_connection {
    export type RequestParams = {
      /** Connection Id */
      connectionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteConnectionData;
  }

  /**
   * @description Test an API connection
   * @tags dbtn/module:api_connections, dbtn/hasAuth
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/connections/test
   */
  export namespace test_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ApiConnectionTest;
    export type RequestHeaders = {};
    export type ResponseBody = TestConnectionData;
  }

  /**
   * @description List all workflows for a user
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name list_workflows
   * @summary List Workflows
   * @request GET:/routes/workflows
   */
  export namespace list_workflows {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListWorkflowsData;
  }

  /**
   * @description Create a new workflow
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name create_workflow
   * @summary Create Workflow
   * @request POST:/routes/workflows
   */
  export namespace create_workflow {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = WorkflowCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateWorkflowData;
  }

  /**
   * @description Get workflow details
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name get_workflow
   * @summary Get Workflow
   * @request GET:/routes/workflows/{workflow_id}
   */
  export namespace get_workflow {
    export type RequestParams = {
      /** Workflow Id */
      workflowId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetWorkflowData;
  }

  /**
   * @description Update a workflow
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name update_workflow
   * @summary Update Workflow
   * @request PUT:/routes/workflows/{workflow_id}
   */
  export namespace update_workflow {
    export type RequestParams = {
      /** Workflow Id */
      workflowId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = WorkflowUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateWorkflowData;
  }

  /**
   * @description Delete a workflow
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name delete_workflow
   * @summary Delete Workflow
   * @request DELETE:/routes/workflows/{workflow_id}
   */
  export namespace delete_workflow {
    export type RequestParams = {
      /** Workflow Id */
      workflowId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteWorkflowData;
  }

  /**
   * @description Execute a workflow
   * @tags dbtn/module:workflows, dbtn/hasAuth
   * @name execute_workflow
   * @summary Execute Workflow
   * @request POST:/routes/workflows/execute
   */
  export namespace execute_workflow {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = WorkflowExecuteInput;
    export type RequestHeaders = {};
    export type ResponseBody = ExecuteWorkflowData;
  }
}
