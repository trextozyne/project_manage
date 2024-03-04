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
import {Projects, ProjectsService, taskPerUser} from "../../shared/services/projects/projects.service";
import {Project} from "../../shared/models/project";
import {DaymonthpipePipe} from "../../shared/pipes/daymonthpipe.pipe";
import {Users, UsersService} from "../../shared/services/users/users.service";
import {User} from "../../shared/models/user";
import {Observable, from} from "rxjs";
import {TeamsService} from "../../shared/services/teams/teams.service";
import {Team} from "../../shared/models/team";
import {first, map, switchMap} from "rxjs/operators";
import {FullDatePipePipe} from "../../shared/pipes/full-date-pipe.pipe";
import {DaysleftPipe} from "../../shared/pipes/daysleft.pipe";
import {ListDataWrapperComponent} from "../../shared/tools/containers/list-containers/list-data-wrapper/list-data-wrapper.component";
import {RandomBackgroundStyleDirective} from "../../shared/Directives/random-background-style.directive";



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

  @ViewChild("projectBoxes", {static: true}) projectBoxes!: ElementRef;
  isGridView: boolean = true;

  renderer = inject(Renderer2);
  projectService = inject(ProjectsService);
  userService = inject(UsersService);
  teamService = inject(TeamsService);

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
        const taskPerUser: taskPerUser[] = [];

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
          userObj.projectTask = {name: projectTask?.name, startDate: projectTask?.startDate, endDate: projectTask?.endDate}

          userObj.userTask.push(...this.projectService.getUserLevelTask(project.tasks, user.task));

          taskPerUser.push(
            ...this.projectService.getTaskPerUser(project.tasks, user)
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

  private consolidateUsersAssignedWithTaskOrWithoutTask(tasksPerUser: taskPerUser[], currentUserData: any[]) {
    // Extract ids
    const taskPerUserIds = new Set(tasksPerUser.map((user: taskPerUser) => user.id));

    // Find ids in currentUserData that are not in tasksPerUser
    const idsToAdd = currentUserData
      .filter((user: User) => !taskPerUserIds.has(user.id))
      .map((user: User) => user.id);

    // Add missing ids to tasksPerUser with empty properties
    from(idsToAdd).pipe(
        switchMap(id => this.userService.getUserById(id)
        ),
        map((user: User) => user)
      ).subscribe(data => {
        tasksPerUser.push({
          id: data.id,
          name: data.name,
          imgPath: '/assets/images/' + data.imagePath,
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

    let taskPerUser =  this.taskByUser().at(index).taskPerUser;
    let $userImageData = this.taskByUser().at(index).userImageData;

    if (this.listDataComponent)
      this.listDataComponent.instance.emitChosenUser.pipe(first()).subscribe((userData: {id: any, isAssignedToTeam: boolean, img: string}) => {
        console.log(userData)
        this.taskByUser().at(index).userImageData =
          $userImageData.filter((userInfo: {id: any, isAssignedToTeam: boolean, img: string}) => userInfo.id !== userData.id);

        this.taskByUser().at(index).taskPerUser =
          taskPerUser.filter(($userData: taskPerUser) => $userData.id !== userData.id);
        //if (userData) this.users.set(users.users);
        this.closeBottomSheet()
      });

    this.overlay.nativeElement.style.display = 'flex';
    this._bottomSheet.nativeElement.style.bottom = '0';

    console.log($event);
    $event.preventDefault();
  }

  onAddParticipants(index: number, projectId: any, userImageData: {id: any, isAssignedToTeam: boolean, img: string}[], $event: MouseEvent) {
    // there should be a tab for add to team, add as extra
    // code any removal from team updates team db, removal from extra updates project db "assignedUser"
    this.createListComponent(true, projectId, userImageData);

    let taskPerUser =  this.taskByUser().at(index).taskPerUser;
    const $userImageData = this.taskByUser().at(index).userImageData;

    if (this.listDataComponent)
      this.listDataComponent.instance.emitChosenUser.pipe(first()).subscribe((userData: {id: any, isAssignedToTeam: boolean, img: string}) => {

        $userImageData.push(userData);

        //update dropdown section
        taskPerUser = this.consolidateUsersAssignedWithTaskOrWithoutTask(taskPerUser, $userImageData);

        console.log(this.taskByUser())

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
