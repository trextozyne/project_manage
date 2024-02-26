

// task.model.ts
export interface Task {//subtask
  id: any;
  stage: string;
  completed: boolean;
  points: number;
  dateCreated: string;
}

