import React, { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import useTasksStore from '../features/tasks/store/tasksStore';
import useTeamStore from '../features/team/store/teamStore';
import useAccountsStore from '../features/accounts/store/accountsStore';
import useDealsStore from '../features/deals/store/dealsStore';
import { Task } from '../features/tasks/types';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import TaskCalendar from '../components/tasks/TaskCalendar';
import TaskSocialView from '../components/tasks/TaskSocialView';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Define view types for the task manager
type ViewType = 'list' | 'calendar' | 'social';

export default function Tasks() {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTasksStore();
  const { teamMembers, fetchTeamMembers } = useTeamStore();
  const { accounts, fetchAccounts } = useAccountsStore();
  const { deals, fetchDeals } = useDealsStore();
  const { toast } = useToast();

  // View state
  const [activeView, setActiveView] = useState<ViewType>('list');

  // States for task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isSocialPost, setIsSocialPost] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on component mount
  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
    fetchAccounts();
    fetchDeals();
  }, [fetchTasks, fetchTeamMembers, fetchAccounts, fetchDeals]);

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // Assignee filter
    if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Handle task editing
  const handleEditTask = (task: Task) => {
    setCurrentTaskId(task.id);
    setIsEditing(true);
    setIsSocialPost(task.is_social_post || false);
    setShowTaskForm(true);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        toast({
          title: 'Success',
          description: 'Task deleted successfully',
          variant: 'success',
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete task',
          variant: 'destructive',
        });
      }
    }
  };

  // Toggle social post mode
  const toggleSocialPost = (value: boolean) => {
    setIsSocialPost(value);
  };

  // Get entity name (account, deal) for display
  const getEntityName = (type: string, id?: string): string => {
    if (!id) return 'Unknown';

    switch (type) {
      case 'account':
        const account = accounts.find(a => a.id === id);
        return account ? account.name : 'Unknown Account';
      case 'deal':
        const deal = deals.find(d => d.id === id);
        return deal ? deal.name : 'Unknown Deal';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentTaskId(null);
                  setIsSocialPost(false);
                  setShowTaskForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                <span>Add Task</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentTaskId(null);
                  setIsSocialPost(true);
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
                  Social Posts
                </button>
              </nav>
            </div>
          </div>

          {/* View-specific content */}
          {activeView === 'list' && (
            <TaskList
              tasks={filteredTasks}
              teamMembers={teamMembers}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              assigneeFilter={assigneeFilter}
              setAssigneeFilter={setAssigneeFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              getEntityName={getEntityName}
            />
          )}

          {activeView === 'calendar' && (
            <TaskCalendar
              tasks={tasks}
              handleEditTask={handleEditTask}
              localizer={localizer}
            />
          )}

          {activeView === 'social' && (
            <TaskSocialView
              tasks={tasks.filter(task => task.is_social_post)}
              teamMembers={teamMembers}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onSubmit={async (formData) => {
            try {
              if (isEditing && currentTaskId) {
                await updateTask(currentTaskId, formData);
                toast({
                  title: 'Success',
                  description: 'Task updated successfully',
                  variant: 'success',
                });
              } else {
                await addTask(formData);
                toast({
                  title: 'Success',
                  description: 'Task created successfully',
                  variant: 'success',
                });
              }
              setShowTaskForm(false);
            } catch (error) {
              console.error('Error saving task:', error);
              toast({
                title: 'Error',
                description: 'Failed to save task',
                variant: 'destructive',
              });
            }
          }}
          isEditing={isEditing}
          currentTask={currentTaskId ? tasks.find(t => t.id === currentTaskId) : undefined}
          isSocialPost={isSocialPost}
          teamMembers={teamMembers}
          accounts={accounts}
          deals={deals}
        />
      )}

      <Toaster />
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