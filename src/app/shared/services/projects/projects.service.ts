import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Project} from "../../models/project";
import {map, reduce} from "rxjs/operators";
import {Tasks} from "../../models/tasks";
import {Observable, from} from "rxjs";
import {UserProgress} from "../../models/user-progress";

export interface Projects {
  projects: Project[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  http = inject(HttpClient)

  constructor() { }

  getProjects(): Observable<Projects> {
    return this.http.get<Projects>('/assets/data/projects.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  getProjectById(id: any) {
    return this.getProjects().pipe(
      map((projects: Projects) => projects.projects.find(project => project.projectId === id))
    );
  }

  getUserLevelTask(tasks: Tasks[], userTask: { id: any; dateAssigned: string; dateCompleted: string }[]) {
    const stagesArray: string[] = [];

    userTask.forEach(_userTask => {
      tasks.forEach((_task: Tasks) => {
        const matchingTask = _task.task.find($task => $task && _userTask && $task.id === _userTask.id);
        if (matchingTask) {
          stagesArray.push(matchingTask.stage);
        }
      });
    });

    return stagesArray;
  }

  getProjectLevelTask(taskId: any, tasks: Tasks[]) {
    return tasks && tasks.find(task => task.taskId === taskId);
  }

  getUserProgress(userProgress: UserProgress[]) {
    return  from(userProgress).pipe(
      map((user: UserProgress) => ({
        completedTasks: user.completedTasks,
        totalTasks: user.totalTasks
      })),
      reduce((acc, status: { completedTasks: number, totalTasks: number }) => {
        return {
          totalCompletedTasks: acc.totalCompletedTasks + status.completedTasks,
          totalTasks: acc.totalTasks + status.totalTasks
        };
      }, { totalCompletedTasks: 0, totalTasks: 0 }),
      map((result: {totalCompletedTasks: number, totalTasks: number}) => {
        const progressPercentage = (result.totalCompletedTasks / result.totalTasks) * 100;
        return {
          totalCompletedTasks: result.totalCompletedTasks,
          totalTasks: result.totalTasks,
          progressPercentage
        };
      })
    )
  }
}
