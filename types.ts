export enum ItemType {
  Task = 'Task',
  Milestone = 'Milestone',
}

export interface Task {
  id: string;
  name: string;
  duration: number; // in days
  type: ItemType.Task;
}

export interface Milestone {
  id: string;
  name: string;
  type: ItemType.Milestone;
}

export interface Phase {
  id: string;
  name: string;
  items: (Task | Milestone)[][];
}

export interface GanttRow {
  id: string;
  name: string;
  type: 'Phase' | 'Task' | 'Milestone';
  startDate: Date;
  endDate: Date;
  duration: number;
  level: number; // 0 for phase, 1 for items
  daysFromStart: number;
}