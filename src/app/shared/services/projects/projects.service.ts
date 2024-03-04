import {effect, inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Project} from "../../models/project";
import {catchError, first, map, reduce} from "rxjs/operators";
import {Tasks} from "../../models/tasks";
import {Observable, from, ReplaySubject} from "rxjs";
import {UserProgress} from "../../models/user-progress";
import {UsersService} from "../users/users.service";
import {User} from "../../models/user";

export interface Projects {
  projects: Project[];
}

export interface taskPerUser  {
  id: string, name: string, imgPath: string,
  userTask: { taskStage: string, dateAssigned: string }[],
  completedTasks: number, totalTasks: number, progressPercentage: number
}


@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  http = inject(HttpClient)
  userService = inject(UsersService);
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

  getTaskPerUser(tasks: Tasks[], $user: UserProgress) {
    let $tasksPerUser = [] as taskPerUser[];
    const tasksPerUser: taskPerUser = {} as any;
    this.userService.getUserById($user.userId).pipe(first()).subscribe((_user: User) => {
      tasksPerUser.id = _user.id;
      tasksPerUser.name = _user.name;
      tasksPerUser.imgPath = '/assets/images/' + _user.imagePath;
      tasksPerUser.completedTasks = $user.completedTasks;
      tasksPerUser.totalTasks = $user.totalTasks;
      tasksPerUser.progressPercentage = $user.progressPercentage;
      tasksPerUser.userTask = [];

      $user.task.forEach(_userTask => {
        tasks.forEach((_task: Tasks) => {
          const matchingTask = _task.task.find($task => $task && _userTask && $task.id === _userTask.id);
          if (matchingTask) {
            tasksPerUser.userTask.push({taskStage: matchingTask.stage, dateAssigned: _userTask.dateAssigned});
          }
        });
      });

      $tasksPerUser.push(tasksPerUser)
    });

    return $tasksPerUser;
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

  addUserToAssignedTeams(id: any) {
    console.log("added to team for projectId", id)
  }

  addUserToAssignedUsers(id: any) {
    console.log("added to single-user for projectId", id)
  }

  removeUserFromAssignedTeams(id: any) {
    console.log("removed from team for projectId", id)
  }

  removeUserFromAssignedUsers(id: any) {
    console.log("removed from single-user for projectId", id)
  }
}
