
// for removed user history
export interface TaskPerUser {
  tasksTaskName: string;
  projectName: string;
  projectId: any;
  id: string,
  name: string,
  imgPath: string,
  tasksTaskId: any,
  assigned: boolean,
  userTask: { taskStage: string, dateAssigned: string }[],
  completedTasks: number,
  totalTasks: number,
  progressPercentage: number
}
