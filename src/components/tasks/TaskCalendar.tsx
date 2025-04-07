import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { parseISO, isValid } from 'date-fns';
import { Task } from '../../features/tasks/types';

interface TaskCalendarProps {
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  localizer: any;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
}

export default function TaskCalendar({ tasks, handleEditTask, localizer }: TaskCalendarProps) {
  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks
    .filter(task => task.due_date) // Only include tasks with due dates
    .map(task => {
      // Parse the due date
      const dueDate = task.due_date ? parseISO(task.due_date) : new Date();
      
      // If it's not a valid date, skip this task
      if (!isValid(dueDate)) {
        return null;
      }
      
      // For tasks with specific times
      let startDate = dueDate;
      let endDate = dueDate;
      let allDay = true;
      
      if (task.start_time && task.end_time) {
        const startTime = parseISO(task.start_time);
        const endTime = parseISO(task.end_time);
        
        if (isValid(startTime) && isValid(endTime)) {
          startDate = startTime;
          endDate = endTime;
          allDay = false;
        }
      }
      
      // Set end of day for all-day events
      if (allDay) {
        endDate = new Date(dueDate);
        endDate.setHours(23, 59, 59);
      }
      
      return {
        id: task.id,
        title: task.title,
        start: startDate,
        end: endDate,
        allDay: task.all_day || allDay,
        resource: task
      };
    })
    .filter(Boolean) as CalendarEvent[]; // Filter out null events

  // Custom event styling based on task properties
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad'; // Default blue
    
    // Style based on priority
    if (event.resource.priority === 'high') {
      backgroundColor = '#ef4444'; // Red for high priority
    } else if (event.resource.priority === 'medium') {
      backgroundColor = '#f97316'; // Orange for medium priority
    } else if (event.resource.priority === 'low') {
      backgroundColor = '#22c55e'; // Green for low priority
    }
    
    // If it's a social post, use purple
    if (event.resource.is_social_post) {
      backgroundColor = '#8b5cf6'; // Purple for social posts
    }
    
    // If task is completed, make it more muted
    if (event.resource.status === 'completed') {
      backgroundColor = '#9ca3af'; // Gray for completed tasks
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm" style={{ height: 'calc(100vh - 250px)' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event: CalendarEvent) => handleEditTask(event.resource)}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        selectable
      />
    </div>
  );
}
