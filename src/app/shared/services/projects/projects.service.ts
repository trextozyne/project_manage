import {effect, inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Project} from "../../models/project";
import {catchError, map, reduce} from "rxjs/operators";
import {Tasks} from "../../models/tasks";
import {Observable, from, ReplaySubject} from "rxjs";
import {UserProgress} from "../../models/user-progress";

export interface Projects {
  projects: Project[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  http = inject(HttpClient)
  //private projectDataCache$: Observable<Projects> = new Observable<Projects>();
  private projectDataCache$ = new ReplaySubject<Projects>(1);

  constructor() {
    //this.projectDataCache$ = this.fetchProjectData();
    effect((onCleanup) => {
      const sub = this.fetchProjectData().pipe(
        catchError(error => {
          console.error('Error fetching projects', error);
          return [];
        })
      ).subscribe((projects: Projects) => {
        this.projectDataCache$.next(projects);
        this.projectDataCache$.complete();
      });
      onCleanup(()=> sub.unsubscribe())
    });
  }

  private fetchProjectData() {
    return this.http.get<Projects>('/assets/data/projects.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  updateProjectData(): void {
    this.fetchProjectData();
  }

  getProjects() {
    return this.projectDataCache$;
  }

  getProjectById(id: any): Observable<Project | undefined> {
    return this.projectDataCache$.pipe(
      map((projects: Projects) => projects && projects.projects && projects.projects.find(project => project.projectId === id))
    );
  }

  getUserLevelTask(tasks: Tasks[], userTask: { id: any; dateAssigned: string; dateCompleted: string }[]) {
    const stagesArray: { taskStage: string, dateAssigned: string }[] = [];

    userTask.forEach(_userTask => {
      tasks.forEach((_task: Tasks) => {
        const matchingTask = _task.task.find($task => $task && _userTask && $task.id === _userTask.id);
        if (matchingTask) {
          stagesArray.push({taskStage: matchingTask.stage, dateAssigned: _userTask.dateAssigned});
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
