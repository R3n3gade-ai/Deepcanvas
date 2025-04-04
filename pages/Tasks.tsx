import React, { useState } from "react";
import { Sidebar } from "components/Sidebar";
import { useTasksStore } from "utils/tasksStore";
import { useTeamStore } from "utils/teamStore";
import { useAccountsStore } from "utils/accountsStore";
import { useDealsStore } from "utils/dealsStore";
import { useToast } from "utils/AppProvider";
import { Task } from "utils/types";
import { AppProvider } from "utils/AppProvider";

function TasksContent() {
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore();
  const { teamMembers } = useTeamStore();
  const { accounts } = useAccountsStore();
  const { deals } = useDealsStore();
  const { showToast } = useToast();
  
  // States for task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({ 
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    related_to_type: undefined,
    related_to_id: undefined,
  });
  
  // States for validation
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'pending',
      priority: 'medium',
      assigned_to: '',
      related_to_type: undefined,
      related_to_id: undefined,
    });
    setIsEditing(false);
    setCurrentTaskId(null);
    setFormSubmitted(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate required fields
    if (!formData.title || !formData.due_date || !formData.assigned_to || 
        (formData.related_to_type && !formData.related_to_id)) {
      return; // Don't proceed if validation fails
    }
    
    try {
      if (isEditing && currentTaskId) {
        // Update existing task
        await updateTask(currentTaskId, formData);
        showToast('Task updated successfully', 'success');
      } else {
        // Add new task
        await addTask(formData);
        showToast('Task created successfully', 'success');
      }
      
      // Reset form and close modal
      resetForm();
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('Failed to save task', 'error');
    }
  };
  
  // Edit task
  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to,
      related_to_type: task.related_to_type,
      related_to_id: task.related_to_id,
    });
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setShowTaskForm(true);
    setFormSubmitted(false);
  };
  
  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        showToast('Task deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
      }
    }
  };
  
  // Apply filters to task list
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // Assignee filter
    if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) return false;
    
    return true;
  });
  
  // Helper to get entity name
  const getEntityName = (type?: string, id?: string) => {
    if (!type || !id) return 'None';
    
    if (type === 'account') {
      const account = accounts.find(a => a.id === id);
      return account ? account.name : 'Unknown Account';
    } else if (type === 'deal') {
      const deal = deals.find(d => d.id === id);
      return deal ? deal.name : 'Unknown Deal';
    }
    
    return 'None';
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <button
              onClick={() => {
                resetForm();
                setShowTaskForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Add Task</span>
            </button>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Task['status'] | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
              >
                <option value="all">All Assignees</option>
                {teamMembers.map((member, index) => (
                  <option key={`filter-${member.id || `unassigned-${index}`}`} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Task List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredTasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr key="task-header-row">
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Task</th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Assignee</th>
                    <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Related To</th>
                    <th className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task, index) => {
                    const assignee = teamMembers.find(member => member.id === task.assigned_to);
                    
                    return (
                      <tr key={`task-row-${task.id}-${index}`} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">{task.due_date}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status === 'in_progress' ? 'In Progress' : 
                             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {assignee ? assignee.name : 'Unassigned'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {task.related_to_type ? (
                            <span>
                              {task.related_to_type.charAt(0).toUpperCase() + task.related_to_type.slice(1)}:
                              {' '}{getEntityName(task.related_to_type, task.related_to_id)}
                            </span>
                          ) : 'None'}
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No tasks found matching your filters.
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowTaskForm(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Show validation errors if the form was submitted with errors */}
                {formSubmitted && (formData.title === '' || formData.due_date === '' || formData.assigned_to === '' || 
                 (formData.related_to_type && !formData.related_to_id)) ? (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    Please fill in all required fields marked with an asterisk (*).
                  </div>
                ) : null}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={`border ${formSubmitted && !formData.title ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        required
                        className={`border ${formSubmitted && !formData.due_date ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={handleInputChange}
                        required
                        className={`border ${formSubmitted && !formData.assigned_to ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                      >
                        <option value="">Select Assignee</option>
                        {teamMembers.map((member, index) => (
                          <option key={`form-${member.id || `unassigned-${index}`}`} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related To</label>
                      <select
                        name="related_to_type"
                        value={formData.related_to_type || ''}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="">None</option>
                        <option value="account">Account</option>
                        <option value="deal">Deal</option>
                      </select>
                    </div>
                    
                    {formData.related_to_type && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.related_to_type === 'account' ? 'Account' : 'Deal'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="related_to_id"
                          value={formData.related_to_id || ''}
                          onChange={handleInputChange}
                          required
                          className={`border ${formSubmitted && !formData.related_to_id ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                        >
                          <option value="">Select {formData.related_to_type === 'account' ? 'Account' : 'Deal'}</option>
                          {formData.related_to_type === 'account' ? (
                            accounts.map(account => (
                              <option key={`rel-account-${account.id}`} value={account.id}>{account.name}</option>
                            ))
                          ) : (
                            deals.map(deal => (
                              <option key={`rel-deal-${deal.id}`} value={deal.id}>{deal.name}</option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowTaskForm(false);
                    }}
                    className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

export default function Tasks() {
  return (
    <AppProvider>
      <TasksContent />
    </AppProvider>
  );
}
