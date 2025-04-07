import React, { useState, useCallback, useMemo } from "react";
import { Sidebar } from "components/Sidebar";
import { useTasksStore } from "utils/tasksStore";
import { useTeamStore } from "utils/teamStore";
import { useAccountsStore } from "utils/accountsStore";
import { useDealsStore } from "utils/dealsStore";
import { useToast } from "utils/AppProvider";
import { Task } from "utils/types";
import { AppProvider } from "utils/AppProvider";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { format, parseISO, isValid } from 'date-fns';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Define view types for the task manager
type ViewType = 'list' | 'calendar' | 'social';

function TasksContent() {
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore();
  const { teamMembers } = useTeamStore();
  const { accounts } = useAccountsStore();
  const { deals } = useDealsStore();
  const { showToast } = useToast();

  // View state
  const [activeView, setActiveView] = useState<ViewType>('list');

  // States for task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isSocialPost, setIsSocialPost] = useState(false);

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
    // Calendar-specific fields
    start_time: '',
    end_time: '',
    all_day: true,
    // Social media-specific fields
    is_social_post: false,
    social_platform: undefined,
    social_content: '',
    social_image_url: '',
    social_scheduled_time: '',
    social_post_status: 'draft',
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
      // Calendar-specific fields
      start_time: '',
      end_time: '',
      all_day: true,
      // Social media-specific fields
      is_social_post: false,
      social_platform: undefined,
      social_content: '',
      social_image_url: '',
      social_scheduled_time: '',
      social_post_status: 'draft',
    });
    setIsEditing(false);
    setCurrentTaskId(null);
    setFormSubmitted(false);
    setIsSocialPost(false);
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
      // Calendar-specific fields
      start_time: task.start_time || '',
      end_time: task.end_time || '',
      all_day: task.all_day || true,
      // Social media-specific fields
      is_social_post: task.is_social_post || false,
      social_platform: task.social_platform,
      social_content: task.social_content || '',
      social_image_url: task.social_image_url || '',
      social_scheduled_time: task.social_scheduled_time || '',
      social_post_status: task.social_post_status || 'draft',
    });
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setShowTaskForm(true);
    setFormSubmitted(false);
    setIsSocialPost(task.is_social_post || false);
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
    } else if (type === 'social_post') {
      return 'Social Media Post';
    }

    return 'None';
  };

  // Calendar event conversion
  const calendarEvents = useMemo(() => {
    return tasks.map(task => {
      // Determine start and end dates
      let start = new Date(task.due_date);
      let end = new Date(task.due_date);

      // If specific times are set, use them
      if (task.start_time) {
        const [hours, minutes] = task.start_time.split(':').map(Number);
        start.setHours(hours, minutes);
      }

      if (task.end_time) {
        const [hours, minutes] = task.end_time.split(':').map(Number);
        end.setHours(hours, minutes);
      } else if (task.start_time) {
        // Default to 1 hour duration if only start time is set
        const [hours, minutes] = task.start_time.split(':').map(Number);
        end.setHours(hours + 1, minutes);
      } else {
        // Default to all-day event
        end.setHours(23, 59, 59);
      }

      return {
        id: task.id,
        title: task.title,
        start,
        end,
        allDay: task.all_day,
        resource: task,
      };
    });
  }, [tasks]);

  // Social media posts
  const socialMediaPosts = useMemo(() => {
    return tasks.filter(task => task.is_social_post);
  }, [tasks]);

  // Handle calendar event selection
  const handleSelectEvent = useCallback((event: any) => {
    handleEditTask(event.resource);
  }, []);

  // Handle calendar slot selection (for creating new events)
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    resetForm();

    // Format date and time for the form
    const date = format(start, 'yyyy-MM-dd');
    const startTime = format(start, 'HH:mm');
    const endTime = format(end, 'HH:mm');
    const isAllDay = start.getHours() === 0 && start.getMinutes() === 0 &&
                    end.getHours() === 23 && end.getMinutes() === 59;

    setFormData(prev => ({
      ...prev,
      due_date: date,
      start_time: startTime,
      end_time: endTime,
      all_day: isAllDay,
    }));

    setShowTaskForm(true);
  }, []);

  // Toggle between task and social post
  const toggleSocialPost = (value: boolean) => {
    setIsSocialPost(value);
    setFormData(prev => ({
      ...prev,
      is_social_post: value,
      related_to_type: value ? 'social_post' : prev.related_to_type,
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <div className="flex space-x-2">
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
              <button
                onClick={() => {
                  resetForm();
                  toggleSocialPost(true);
                  setShowTaskForm(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <SocialIcon className="h-5 w-5 mr-1" />
                <span>New Social Post</span>
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveView('list')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <ListIcon className="h-5 w-5 inline mr-2" />
                  List View
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <CalendarIcon className="h-5 w-5 inline mr-2" />
                  Calendar
                </button>
                <button
                  onClick={() => setActiveView('social')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeView === 'social'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <SocialIcon className="h-5 w-5 inline mr-2" />
                  Social Media
                </button>
              </nav>
            </div>
          </div>

          {/* View-specific content */}
          {activeView === 'list' && (
            <>
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
                              {task.is_social_post && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                  <SocialIcon className="h-3 w-3 mr-1" />
                                  Social Post
                                </span>
                              )}
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
            </>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
              <div style={{ height: 700 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="month"
                  eventPropGetter={(event) => {
                    const task = event.resource as Task;
                    let backgroundColor = '#3b82f6'; // Default blue

                    if (task.priority === 'high') {
                      backgroundColor = '#ef4444'; // Red for high priority
                    } else if (task.priority === 'medium') {
                      backgroundColor = '#f97316'; // Orange for medium priority
                    } else if (task.priority === 'low') {
                      backgroundColor = '#6b7280'; // Gray for low priority
                    }

                    if (task.status === 'completed') {
                      backgroundColor = '#10b981'; // Green for completed tasks
                    }

                    if (task.is_social_post) {
                      backgroundColor = '#8b5cf6'; // Purple for social posts
                    }

                    return {
                      style: {
                        backgroundColor,
                        borderRadius: '4px',
                      }
                    };
                  }}
                />
              </div>
            </div>
          )}

          {/* Social Media View */}
          {activeView === 'social' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Social Media Posts</h2>
                <p className="text-gray-500">Schedule and manage your social media content</p>
              </div>

              {socialMediaPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {socialMediaPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {post.social_image_url && (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <img
                            src={post.social_image_url}
                            alt="Social media post image"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{post.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            post.social_post_status === 'posted' ? 'bg-green-100 text-green-800' :
                            post.social_post_status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            post.social_post_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.social_post_status?.charAt(0).toUpperCase() + post.social_post_status?.slice(1) || 'Draft'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{post.social_content || post.description}</p>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <span className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {post.social_scheduled_time ? (
                              <span>Scheduled for {post.social_scheduled_time}</span>
                            ) : (
                              <span>Due {post.due_date}</span>
                            )}
                          </span>

                          {post.social_platform && (
                            <span className="ml-3 flex items-center">
                              <SocialIcon className="h-3 w-3 mr-1" />
                              {post.social_platform.charAt(0).toUpperCase() + post.social_platform.slice(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => handleEditTask(post)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(post.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <SocialIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No social media posts yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first social media post to schedule content across your platforms.
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      toggleSocialPost(true);
                      setShowTaskForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md inline-flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    <span>Create Social Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
                {/* Task Type Toggle */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!isSocialPost ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                      onClick={() => toggleSocialPost(false)}
                    >
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      Task
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg ${isSocialPost ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                      onClick={() => toggleSocialPost(true)}
                    >
                      <SocialIcon className="h-4 w-4 inline mr-2" />
                      Social Post
                    </button>
                  </div>
                </div>

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
                        disabled={isSocialPost}
                      >
                        <option value="">None</option>
                        <option value="account">Account</option>
                        <option value="deal">Deal</option>
                        {!isSocialPost && <option value="social_post">Social Media Post</option>}
                      </select>
                    </div>

                    {formData.related_to_type && formData.related_to_type !== 'social_post' && (
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

                  {/* Calendar-specific fields */}
                  {activeView === 'calendar' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Calendar Details
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="all_day"
                          name="all_day"
                          checked={formData.all_day}
                          onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <label htmlFor="all_day" className="ml-2 block text-sm text-gray-700">
                          All-day event
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Social Media Post fields */}
                  {(isSocialPost || formData.related_to_type === 'social_post') && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-md border border-purple-100">
                      <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
                        <SocialIcon className="h-4 w-4 mr-1" />
                        Social Media Post Details
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select
                          name="social_platform"
                          value={formData.social_platform || ''}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-3"
                        >
                          <option value="">Select Platform</option>
                          <option value="twitter">Twitter</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Post Content</label>
                        <textarea
                          name="social_content"
                          value={formData.social_content}
                          onChange={handleInputChange}
                          rows={3}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          placeholder="What would you like to post?"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                        <input
                          type="text"
                          name="social_image_url"
                          value={formData.social_image_url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                          <input
                            type="datetime-local"
                            name="social_scheduled_time"
                            value={formData.social_scheduled_time}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            name="social_post_status"
                            value={formData.social_post_status}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          >
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="posted">Posted</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="hidden"
                        name="is_social_post"
                        value="true"
                      />
                    </div>
                  )}
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

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SocialIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
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
