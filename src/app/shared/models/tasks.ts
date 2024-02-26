
import {Task} from "./task";

export interface Tasks {
  taskId: any;
  name: string;
  startDate: string;
  endDate: string;
  task: Task[];
}
