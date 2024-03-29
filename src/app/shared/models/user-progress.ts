

export interface UserProgress {
  userId: any;
  taskId: any;
  assigned: boolean,
  task: { id: any; dateAssigned: string; dateCompleted: string }[];
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
}

