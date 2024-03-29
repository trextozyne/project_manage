

// project.model.ts
import {Tasks} from "./tasks";
import {Task} from "./task";
import {AssignedTeam} from "./assigned-team";
import {UserProgress} from "./user-progress";
import {TaskPerUser} from "./taskPerUser";

export interface Project {
  projectId: any;
  name: string;
  startDate: string;
  endDate: string;
  assignmentHistory: TaskPerUser[],
  tasks: Tasks[]
  progressType: {userDefined: boolean, weighted: boolean, timeBased: boolean, task: boolean}
  //task: Task[];
  assignedUsers?: { userId: any }[];
  assignedTeams?: AssignedTeam[];
  userProgress: UserProgress[]; //forloop to assign each team user
  completed: boolean;
}


