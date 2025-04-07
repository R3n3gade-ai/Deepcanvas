import React, { useState, useEffect } from 'react';
import { Task } from '../../features/tasks/types';
import { TeamMember } from '../../features/team/types';
import { Account } from '../../features/accounts/types';
import { Deal } from '../../features/deals/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  isEditing: boolean;
  currentTask?: Task;
  isSocialPost: boolean;
  teamMembers: TeamMember[];
  accounts: Account[];
  deals: Deal[];
}

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  currentTask,
  isSocialPost,
  teamMembers,
  accounts,
  deals
}: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [relatedToType, setRelatedToType] = useState<'account' | 'deal' | ''>('');
  const [relatedToId, setRelatedToId] = useState('');
  
  // Social post specific fields
  const [socialPlatform, setSocialPlatform] = useState<Task['social_platform']>('twitter');
  const [socialContent, setSocialContent] = useState('');
  const [socialImageUrl, setSocialImageUrl] = useState('');
  const [socialScheduledTime, setSocialScheduledTime] = useState('');
  const [socialPostStatus, setSocialPostStatus] = useState<Task['social_post_status']>('draft');

  // Initialize form with current task data if editing
  useEffect(() => {
    if (isEditing && currentTask) {
      setTitle(currentTask.title || '');
      setDescription(currentTask.description || '');
      setDueDate(currentTask.due_date || '');
      setStatus(currentTask.status || 'pending');
      setPriority(currentTask.priority || 'medium');
      setAssignedTo(currentTask.assigned_to || '');
      setRelatedToType(currentTask.related_to_type || '');
      setRelatedToId(currentTask.related_to_id || '');
      
      // Social post fields
      if (currentTask.is_social_post) {
        setSocialPlatform(currentTask.social_platform || 'twitter');
        setSocialContent(currentTask.social_content || '');
        setSocialImageUrl(currentTask.social_image_url || '');
        setSocialScheduledTime(currentTask.social_scheduled_time || '');
        setSocialPostStatus(currentTask.social_post_status || 'draft');
      }
    } else {
      // Default values for new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
      setPriority('medium');
      setAssignedTo(teamMembers.length > 0 ? teamMembers[0].id : '');
      setRelatedToType('');
      setRelatedToId('');
      
      // Default values for new social post
      setSocialPlatform('twitter');
      setSocialContent('');
      setSocialImageUrl('');
      setSocialScheduledTime('');
      setSocialPostStatus('draft');
    }
  }, [isEditing, currentTask, teamMembers]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Omit<Task, 'id'> = {
      title,
      description,
      due_date: dueDate,
      status,
      priority,
      assigned_to: assignedTo,
      is_social_post: isSocialPost
    };
    
    // Add related entity if selected
    if (relatedToType && relatedToId) {
      taskData.related_to_type = relatedToType;
      taskData.related_to_id = relatedToId;
    }
    
    // Add social post fields if it's a social post
    if (isSocialPost) {
      taskData.social_platform = socialPlatform;
      taskData.social_content = socialContent;
      taskData.social_image_url = socialImageUrl;
      taskData.social_scheduled_time = socialScheduledTime;
      taskData.social_post_status = socialPostStatus;
    }
    
    onSubmit(taskData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit' : 'Create'} {isSocialPost ? 'Social Post' : 'Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              {/* Assignee */}
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  id="assignedTo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select Assignee</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Related To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="relatedToType" className="block text-sm font-medium text-gray-700 mb-1">
                    Related To
                  </label>
                  <select
                    id="relatedToType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={relatedToType}
                    onChange={(e) => {
                      setRelatedToType(e.target.value as 'account' | 'deal' | '');
                      setRelatedToId(''); // Reset the ID when type changes
                    }}
                  >
                    <option value="">None</option>
                    <option value="account">Account</option>
                    <option value="deal">Deal</option>
                  </select>
                </div>
                
                {relatedToType && (
                  <div>
                    <label htmlFor="relatedToId" className="block text-sm font-medium text-gray-700 mb-1">
                      {relatedToType === 'account' ? 'Account' : 'Deal'}
                    </label>
                    <select
                      id="relatedToId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={relatedToId}
                      onChange={(e) => setRelatedToId(e.target.value)}
                      required
                    >
                      <option value="">Select {relatedToType === 'account' ? 'Account' : 'Deal'}</option>
                      {relatedToType === 'account' ? (
                        accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))
                      ) : (
                        deals.map(deal => (
                          <option key={deal.id} value={deal.id}>
                            {deal.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
              
              {/* Social Post Fields */}
              {isSocialPost && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Post Details</h3>
                  
                  <div className="space-y-6">
                    {/* Platform */}
                    <div>
                      <label htmlFor="socialPlatform" className="block text-sm font-medium text-gray-700 mb-1">
                        Platform
                      </label>
                      <select
                        id="socialPlatform"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value as Task['social_platform'])}
                        required
                      >
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                    
                    {/* Content */}
                    <div>
                      <label htmlFor="socialContent" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        id="socialContent"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={socialContent}
                        onChange={(e) => setSocialContent(e.target.value)}
                        required
                      />
                      {socialPlatform === 'twitter' && (
                        <p className="mt-1 text-sm text-gray-500">
                          {280 - socialContent.length} characters remaining
                        </p>
                      )}
                    </div>
                    
                    {/* Image URL */}
                    <div>
                      <label htmlFor="socialImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="socialImageUrl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={socialImageUrl}
                        onChange={(e) => setSocialImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Scheduled Time */}
                      <div>
                        <label htmlFor="socialScheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Scheduled Time
                        </label>
                        <input
                          type="datetime-local"
                          id="socialScheduledTime"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={socialScheduledTime}
                          onChange={(e) => setSocialScheduledTime(e.target.value)}
                        />
                      </div>
                      
                      {/* Post Status */}
                      <div>
                        <label htmlFor="socialPostStatus" className="block text-sm font-medium text-gray-700 mb-1">
                          Post Status
                        </label>
                        <select
                          id="socialPostStatus"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={socialPostStatus}
                          onChange={(e) => setSocialPostStatus(e.target.value as Task['social_post_status'])}
                          required
                        >
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// X Icon component
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
