import { Task } from './types';
import { create } from 'zustand';

interface TasksState {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

export const useTaskSelectionStore = create<TasksState>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
}));
