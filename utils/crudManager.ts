import { useState } from 'react';

export enum CrudMode {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  NONE = 'none'
}

interface CrudState<T> {
  isDialogOpen: boolean;
  mode: CrudMode;
  currentEntity: T | null;
  isLoading: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}

interface CrudManagerParams<T> {
  entityName: string;
  defaultEntity: Omit<T, 'id' | 'created_at' | 'updated_at'>;
  fetchEntities: () => Promise<void>;
  createEntity: (data: Omit<T, 'id'>) => Promise<T>;
  updateEntity: (id: string, data: Partial<T>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  validateEntity?: (data: any) => ValidationErrors;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCrudManager<T extends { id: string }>(
  params: CrudManagerParams<T>
) {
  const {
    entityName,
    defaultEntity,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    validateEntity,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onError
  } = params;

  // State for the CRUD operations
  const [state, setState] = useState<CrudState<T>>({
    isDialogOpen: false,
    mode: CrudMode.NONE,
    currentEntity: null,
    isLoading: false
  });

  // Form state
  const [values, setValues] = useState<any>(defaultEntity);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Open dialog for creating a new entity
  const createNew = () => {
    setValues(defaultEntity);
    setTouched({});
    setErrors({});
    setState({
      isDialogOpen: true,
      mode: CrudMode.CREATE,
      currentEntity: null,
      isLoading: false
    });
  };

  // Open dialog for editing an existing entity
  const edit = (entity: T) => {
    setValues(entity);
    setTouched({});
    setErrors({});
    setState({
      isDialogOpen: true,
      mode: CrudMode.UPDATE,
      currentEntity: entity,
      isLoading: false
    });
  };

  // Open dialog for confirming deletion
  const confirmDelete = (entity: T) => {
    setState({
      isDialogOpen: true,
      mode: CrudMode.DELETE,
      currentEntity: entity,
      isLoading: false
    });
  };

  // Close the dialog
  const closeDialog = () => {
    setState({
      ...state,
      isDialogOpen: false
    });
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert value for number inputs
    let newValue;
    if (type === 'number') {
      newValue = value === '' ? null : Number(value);
    } else {
      newValue = value;
    }
    
    setValues({
      ...values,
      [name]: newValue
    });
  };

  // Handle input blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate on blur if validateEntity is provided
    if (validateEntity) {
      const validationErrors = validateEntity(values);
      setErrors(validationErrors);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Set all fields as touched for validation
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate if validateEntity is provided
    if (validateEntity) {
      const validationErrors = validateEntity(values);
      setErrors(validationErrors);
      
      // Don't submit if there are validation errors
      if (Object.keys(validationErrors).length > 0) {
        // Mark all fields as touched to display errors
        setTouched(allTouched);
        return;
      }
    }

    // Prepare data for submission - ensure empty strings for numeric fields are null
    const submissionData = { ...values };
    Object.keys(submissionData).forEach(key => {
      // Convert empty strings to null for number fields
      if (submissionData[key] === '') {
        submissionData[key] = null;
      }
    });

    setState({
      ...state,
      isLoading: true
    });

    try {
      if (state.mode === CrudMode.CREATE) {
        await createEntity(submissionData);
        await fetchEntities();
        onCreateSuccess?.();
      } else if (state.mode === CrudMode.UPDATE && state.currentEntity) {
        await updateEntity(state.currentEntity.id, submissionData);
        await fetchEntities();
        onUpdateSuccess?.();
      } else if (state.mode === CrudMode.DELETE && state.currentEntity) {
        // Validate entity ID before deletion
        if (!state.currentEntity.id) {
          const error = new Error(`Cannot delete ${entityName}: ID is missing or invalid`);
          console.error(error);
          setState({
            ...state,
            isLoading: false
          });
          onError?.(error);
          return;
        }
        
        console.log(`Deleting ${entityName} with ID: ${state.currentEntity.id}`);
        await deleteEntity(state.currentEntity.id);
        await fetchEntities();
        onDeleteSuccess?.();
      }

      closeDialog();
    } catch (error) {
      setState({
        ...state,
        isLoading: false
      });
      onError?.(error as Error);
    }
  };

  // Dialog title based on mode
  const getDialogTitle = () => {
    switch (state.mode) {
      case CrudMode.CREATE:
        return `Create ${entityName}`;
      case CrudMode.UPDATE:
        return `Edit ${entityName}`;
      case CrudMode.DELETE:
        return `Delete ${entityName}`;
      default:
        return entityName;
    }
  };

  return {
    state,
    form: {
      values,
      touched,
      errors,
      handleChange,
      handleBlur
    },
    createNew,
    edit,
    confirmDelete,
    closeDialog,
    handleSubmit,
    getDialogTitle
  };
}

// Utility validation function for required fields
export function validateRequired(values: any, requiredFields: string[]): ValidationErrors {
  const errors: ValidationErrors = {};
  
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'This field is required';
    }
  });
  
  return errors;
}
