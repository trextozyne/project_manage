import {
  Component,
  ComponentRef,
  computed,
  effect,
  ElementRef, HostListener,
  inject, input, Renderer2,
  signal,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {ProgressBarComponent} from "../../shared/tools/progress-bar/progress-bar.component";
import {TaskContainersComponent} from "../../shared/tools/containers/task-containers/task-containers.component";
import {ButtonComponent} from "../../shared/tools/button/button.component";
import {Projects, ProjectsService} from "../../shared/services/projects/projects.service";
import {Project} from "../../shared/models/project";
import {DaymonthpipePipe} from "../../shared/pipes/daymonthpipe.pipe";
import {Users, UsersService} from "../../shared/services/users/users.service";
import {User} from "../../shared/models/user";
import {Observable, from, of, forkJoin} from "rxjs";
import {TeamsService} from "../../shared/services/teams/teams.service";
import {Team} from "../../shared/models/team";
import {first, map, switchMap} from "rxjs/operators";
import {FullDatePipePipe} from "../../shared/pipes/full-date-pipe.pipe";
import {DaysleftPipe} from "../../shared/pipes/daysleft.pipe";
import {ListDataWrapperComponent} from "../../shared/tools/containers/list-containers/list-data-wrapper/list-data-wrapper.component";
import {RandomBackgroundStyleDirective} from "../../shared/Directives/random-background-style.directive";
import {TaskPerUser} from "../../shared/models/taskPerUser";
import {DialogComponent} from "../../shared/tools/dialog/dialog/dialog.component";
import {MatDialog} from "@angular/material/dialog";



//Strong Type the ViewContainerRef Create s typed ComponentRef
abstract class TypedComponentRef<ComponentClass> extends ComponentRef<ComponentClass> {
  abstract override setInput: <InputName extends keyof ComponentClass>(name: InputName & string, value: ComponentClass[InputName]) => void
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent, DaysleftPipe,
    TaskContainersComponent, ButtonComponent, DaymonthpipePipe, FullDatePipePipe,
    RandomBackgroundStyleDirective],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css'
})
export class TaskManagementComponent {
  renderer = inject(Renderer2);
  projectService = inject(ProjectsService);
  userService = inject(UsersService);
  teamService = inject(TeamsService);
  dialog = inject(MatDialog);

  @ViewChild("projectBoxes", {static: true}) projectBoxes!: ElementRef;
  isGridView: boolean = true;


  isTeamMember: boolean = true;

  @ViewChild('bottomSheetData', { read: ViewContainerRef }) bottomSheet!: ViewContainerRef;
  private listDataComponent!: TypedComponentRef<ListDataWrapperComponent>;
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('bottomSheet') _bottomSheet!: ElementRef;

  currentDate: Date = new Date();
  projects = signal<Project[]>([]);
  users = signal<User[]>([]);

  private projects$ = this.projectService.getProjects();
  private users$: Observable<Users> = this.userService.getUsers();

  projectInProgress = computed(() =>{
    return this.projects().length;
  });
  projectsCompleted =  computed(() => {
    if(this.projects().length) {
      return this.projects().filter((project: Project) =>
        project.completed
      ).length;
    }

    return 0;
  })
  projectsUpcoming = computed(()=> {
    if(this.projects().length) {
      return this.projects().filter(project =>
        (!project.assignedUsers || project.assignedUsers.length === 0) && (!project.assignedTeams || project.assignedTeams.length === 0)).length;
    }

    return 0;
  })

  // taskByProject = computed(()=> {
  //   if(this.projects().length) {
  //     // this.projects().forEach((project: Project) => {
  //     //   project.tasks.every(task => this.projectService.get)
  //     // })
  //   }
  // })

  taskByUser = computed(()=> {
    const _taskByUser: any[] = [];
    if (this.projects().length) {
      this.projects().forEach((project: Project) => {
        const taskPerUser: TaskPerUser[] = [];

        const userObj = {
          project$: undefined as any,
          projectTask: undefined as any,
          userTask: [] as any[],
          taskPerUser: [] as any[],
          userImageData: [] as any[],
          progress: {} as Record<string, any>
        };

        const userImageData: any[] = [];
        let projectProgress = {}

        if (project.assignedUsers && project.assignedUsers.length > 0) {
          project.assignedUsers.forEach(user => {
            this.userService.getUserById(user.userId).pipe(first()).subscribe((user: User) => {
              userImageData.push({id: user.id, isAssignedToTeam: false, img: '/assets/images/' + user.imagePath});
            });
          })
        }
        if (project.assignedTeams && project.assignedTeams.length > 0) {
          project.assignedTeams.forEach(team => {
            this.teamService.getTeamMembers(team.teamId).pipe(first()).subscribe((team: Team) => {
              this.teamService.getTeamUsers(team.members).pipe(first()).subscribe((user: User[]) =>
                user.map(user => userImageData.push({id: user.id, isAssignedToTeam: true, img: '/assets/images/' + user.imagePath}))
              )
            })
            console.log("images:", userImageData);
          })
        }
        this.projectService.getUserProgress(project.userProgress).pipe(first()).subscribe(($projectProgress: { totalCompletedTasks: number, totalTasks: number, progressPercentage: number }) => {
          projectProgress = $projectProgress;
        })

        project.userProgress.forEach(user => {
          this.projectService.getProjectById(project.projectId).pipe(first()).subscribe(($project: Project | undefined) => {
            userObj.project$ = $project
          });

          const projectTask = this.projectService.getProjectLevelTask(user.taskId, project.tasks);
          userObj.projectTask = {tasksTaskId: projectTask?.taskId, name: projectTask?.name, startDate: projectTask?.startDate, endDate: projectTask?.endDate}

          userObj.userTask.push(...this.projectService.getUserLevelTask(project.tasks, user.task));

          taskPerUser.push(
            ...this.projectService.getTaskPerUser({projectId: project.projectId, projectName: project.name}, project.tasks, user, {tasksTaskId: projectTask?.taskId, tasksTaskName: projectTask?.name})
          );
        })

        userObj.taskPerUser = this.consolidateUsersAssignedWithTaskOrWithoutTask(taskPerUser, userImageData);

        userObj.userImageData = userImageData
        userObj.progress = projectProgress
        _taskByUser.push(userObj)
      })
    }

    console.log("taskByUser", _taskByUser)
    return _taskByUser;
  });

  private consolidateUsersAssignedWithTaskOrWithoutTask(tasksPerUser: TaskPerUser[], currentUserData: any[]) {
    // Extract ids and other info
    const taskPerUsers = new Set(tasksPerUser.map((user: TaskPerUser) => ({
      id: user.id,
      projectId: user.projectId,
      projectName: user.projectName,
      tasksTaskId: user.tasksTaskId,
      tasksTaskName: user.tasksTaskName
    })));

    // Find ids in currentUserData that are not in tasksPerUser
    const idsToAdd = currentUserData
      .filter((user: User) => !taskPerUsers.has(user.id))
      .map((user: User) => ({
        id: user.id,
        projectId: Array.from(taskPerUsers)[0]?.projectId,
        projectName: Array.from(taskPerUsers)[0]?.projectName,
        tasksTaskId: Array.from(taskPerUsers)[0]?.tasksTaskId,
        tasksTaskName: Array.from(taskPerUsers)[0]?.tasksTaskName
      }));

    // Add missing data by ids to tasksPerUser with empty properties
    from(idsToAdd).pipe(
      switchMap((p: { id: any, projectId: any, tasksTaskId: any, projectName: string, tasksTaskName: string }) =>
        this.userService.getUserById(p.id).pipe(
          map(user => ({ user, projectId: p.projectId, tasksTaskId: p.tasksTaskId , projectName: p.projectName, tasksTaskName: p.tasksTaskName }))
        )
      )
    ).subscribe(data => {
      tasksPerUser.push({
        projectId: data.projectId,
        projectName: data.projectName,
        id: data.user.id,
        name: data.user.name,
        imgPath: '/assets/images/' + data.user.imagePath,
        tasksTaskId: data.tasksTaskId,
        tasksTaskName: data.tasksTaskName,
        assigned: false,
        userTask: [],
        completedTasks: 0,
        totalTasks: 0,
        progressPercentage: 0
      });
    })

    return tasksPerUser;
  }

    ngOnInit() {}

  constructor() {
    effect((onCleanup)=> {
      const sub = this.projectService.getProjects().subscribe((projects: Projects) => {
        console.log(projects)
        if (projects.projects) this.projects.set(projects.projects);
      });
      onCleanup (()=> sub.unsubscribe)
    })

    effect((onCleanup)=> {
      const sub = this.userService.getUsers().subscribe((users: Users) => {
        console.log(users)
        if (users.users) this.users.set(users.users);
      });
      onCleanup (()=> sub.unsubscribe)
    })
  }

  private createListComponent(isAddUser: boolean, projectId: any, userImageData: { id: any; isAssignedToTeam: boolean; img: string }[]) {
    this.listDataComponent = this.bottomSheet.createComponent(ListDataWrapperComponent);
    this.listDataComponent.instance.isAddUser.set(isAddUser);
    this.listDataComponent.instance.projectId.set(projectId);
    this.listDataComponent.instance.isUserToTeam.set(this.isTeamMember);
    this.listDataComponent.instance.getData().length = 0;
    this.listDataComponent.instance.getData().push(...userImageData);
    this.listDataComponent.instance.projects().push(...this.projects());
    this.listDataComponent.instance.users().push(...this.users());
  }

  onRemoveParticipants(index: number, projectId: any, userImageData: {id: any, isAssignedToTeam: boolean, img: string}[], $event: MouseEvent) {
    //should be able to remove team member/extra user
    this.createListComponent(false, projectId, userImageData);

    let taskPerUser: TaskPerUser[] =  this.taskByUser().at(index).taskPerUser;
    let $userImageData = this.taskByUser().at(index).userImageData;

    if (this.listDataComponent)
      this.listDataComponent.instance.emitChosenUser.pipe(first()).subscribe((userData: {id: any, isAssignedToTeam: boolean, img: string}) => {
        console.log(userData)
        const getSelectedUserTasks = taskPerUser.filter(user => user.id === userData.id);

        if (getSelectedUserTasks.some(user=> user.assigned && user.completedTasks > 0)) {
          const dialogRef = this.dialog.open(DialogComponent, {
            data: {taskPerUser: getSelectedUserTasks[0]}
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.removeUserAssignedToProjectTask(index, $userImageData, getSelectedUserTasks, taskPerUser);
              //this.listDataComponent.instance.updateProject();

              this.listDataComponent.instance.updateProjectAssignmentHistory(getSelectedUserTasks)
            }
          });
        } else {
          this.removeUserAssignedToProjectTask(index, $userImageData, getSelectedUserTasks, taskPerUser);

          this.listDataComponent.instance.updateProject(getSelectedUserTasks);
        }
        this.closeBottomSheet()
      });

    this.overlay.nativeElement.style.display = 'flex';
    this._bottomSheet.nativeElement.style.bottom = '0';

    console.log($event);
    $event.preventDefault();
  }

  private compareUserTaskHistory(userTaskHistory: any, selectedUserTasks: any): Observable<boolean> {
    if (
      (typeof userTaskHistory === 'object' && userTaskHistory !== null) &&
      (typeof selectedUserTasks === 'object' && selectedUserTasks !== null)
    ) {
      const keys1 = Object.keys(userTaskHistory);
      const keys2 = Object.keys(selectedUserTasks);

      if (keys1.length !== keys2.length) {
        return of(false);
      }

      const keyObservables: Observable<boolean>[] = keys1.map((key) => {
        return this.compareUserTaskHistory(userTaskHistory[key], selectedUserTasks[key]);
      });

      return forkJoin(keyObservables).pipe(
        map((results) => results.every((result) => result))
      );
    } else {
      return of(userTaskHistory === selectedUserTasks);
    }
  }

  private removeUserAssignedToProjectTask(index: number, $userImageData: {id: any, isAssignedToTeam: boolean, img: string}[], getSelectedUserTasks: TaskPerUser[], taskPerUser: TaskPerUser[]) {

    this.taskByUser().at(index).userImageData =
      $userImageData.filter((userInfo: {id: any, isAssignedToTeam: boolean, img: string}) => getSelectedUserTasks.some(userData=> userInfo.id !== userData.id));

    this.taskByUser().at(index).taskPerUser =
      taskPerUser.filter(($userData: TaskPerUser) => getSelectedUserTasks.some(userData=> $userData.id !== userData.id));

    // if the taskHistory dont change, dont save
    const userTaskHistory = this.projects().find(project=> getSelectedUserTasks.some(userData => project.projectId === userData.projectId))?.assignmentHistory;
    this.compareUserTaskHistory(userTaskHistory, getSelectedUserTasks).pipe(first()).subscribe(result => {
      if (!result && userTaskHistory) {
        userTaskHistory.push(getSelectedUserTasks[0]);
        //set the bgColor for pgBar in this user task container
      }
    })
  }

  private updateUserProjectHistory(userHistory: TaskPerUser[], taskPerUserShell: TaskPerUser[]) {
    return taskPerUserShell.map(user =>
      userHistory.find($user => $user.id === user.id) || user
    );
  }

  onAddParticipants(index: number, projectId: any, userImageData: {id: any, isAssignedToTeam: boolean, img: string}[], $event: MouseEvent) {
    // there should be a tab for add to team, add as extra
    // code any removal from team updates team db, removal from extra updates project db "assignedUser"
    this.createListComponent(true, projectId, userImageData);

    let taskPerUser =  this.taskByUser().at(index).taskPerUser as TaskPerUser[];
    const $userImageData = this.taskByUser().at(index).userImageData;

    if (this.listDataComponent)
      this.listDataComponent.instance.emitChosenUser.pipe(first()).subscribe((userData: {id: any, isAssignedToTeam: boolean, img: string}) => {
        debugger;
        $userImageData.push(userData);

        const taskPerUserShell = this.consolidateUsersAssignedWithTaskOrWithoutTask(taskPerUser, [userData]);

        // check if userhistroy exist, perfor ops the proceed
        //get that project by its id first then check the histroy
        this.projectService.getProjectById(projectId).pipe(first()).subscribe(($project: Project | undefined) => {
          const userHistory = $project && $project?.assignmentHistory.filter((userHistory: TaskPerUser) => userHistory.id === userData.id)

          if (userHistory && userHistory.length > 0) {
            const dialogRef = this.dialog.open(DialogComponent, {
              data: {userHistory: userHistory}
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                //where result is the index of history chosen, use index to select specific history to restore
                //update dropdown section
                taskPerUser = this.updateUserProjectHistory(userHistory, taskPerUserShell);

                this.taskByUser().at(index).taskPerUser = taskPerUser;
                //this.listDataComponent.instance.updateProject();

                this.listDataComponent.instance.updateProjectAssignmentHistory(taskPerUser)
                console.log(this.taskByUser())
              }
            });
          } else if (userHistory && userHistory.length === 0) {
            taskPerUser = this.updateUserProjectHistory(userHistory, taskPerUserShell);

            this.taskByUser().at(index).taskPerUser = taskPerUser;

            this.listDataComponent.instance.updateProject(taskPerUser);
          }
        });

        this.closeBottomSheet()
      });
    //this.listDataComponent.setInput("users", this.users());

    this.overlay.nativeElement.style.display = 'flex';
    this._bottomSheet.nativeElement.style.bottom = '0';

    console.log($event);
    $event.preventDefault();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    debugger;
    if ((event.target as HTMLElement).classList.contains('overlay'))
      this.closeBottomSheet();
  }

  closeBottomSheet() {
    this.overlay.nativeElement.style.display = 'none';
    this._bottomSheet.nativeElement.style.bottom = '-100%';
    this.bottomSheet.clear();
  }

  calculateDiff(dateSent: string){
    const currentDate = new Date();
    const dateSent$ = new Date(dateSent);

    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent$.getFullYear(), dateSent$.getMonth(), dateSent$.getDate()) ) /(1000 * 60 * 60 * 24));
  }

  toggleTab(){
    this.isTeamMember = !this.isTeamMember;
    this.listDataComponent.instance.isUserToTeam.set(this.isTeamMember);

    if (this.isTeamMember)
      console.log('team')
    else
      console.log('user')
  }

  setGridView($event: MouseEvent) {
    this.isGridView = true;
    if (this.projectBoxes) {
      this.renderer.addClass(this.projectBoxes.nativeElement, 'jsGridView');
      this.renderer.removeClass(this.projectBoxes.nativeElement, 'jsListView');
    }
  }

  setListView($event: MouseEvent) {
    this.isGridView = false;
    if (this.projectBoxes) {
      this.renderer.removeClass(this.projectBoxes.nativeElement, 'jsGridView');
      this.renderer.addClass(this.projectBoxes.nativeElement, 'jsListView');
    }
  }
}
