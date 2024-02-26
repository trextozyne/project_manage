import {
  Component,
  ComponentRef,
  computed,
  effect,
  ElementRef,
  inject,
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
import {Observable} from "rxjs";
import {TeamsService} from "../../shared/services/teams/teams.service";
import {Team} from "../../shared/models/team";
import {first} from "rxjs/operators";
import {FullDatePipePipe} from "../../shared/pipes/full-date-pipe.pipe";
import {DaysleftPipe} from "../../shared/pipes/daysleft.pipe";
import {ListDataWrapperComponent} from "../../shared/tools/containers/list-containers/list-data-wrapper/list-data-wrapper.component";
import {toSignal} from "@angular/core/rxjs-interop";


//Strong Type the ViewContainerRef Create s typed ComponentRef
abstract class TypedComponentRef<ComponentClass> extends ComponentRef<ComponentClass> {
  abstract override setInput: <InputName extends keyof ComponentClass>(name: InputName & string, value: ComponentClass[InputName]) => void
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent, DaysleftPipe,
    TaskContainersComponent, ButtonComponent, DaymonthpipePipe, FullDatePipePipe],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css'
})
export class TaskManagementComponent {
  projectService = inject(ProjectsService);
  userService = inject(UsersService);
  teamService = inject(TeamsService);

  isTeamMember: boolean = true;
  isExtraUser: boolean = false;

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
        const userObj = {
          project$: undefined as any,
          projectTask: undefined as any,
          userTask: [] as any[],
          userImageData: [] as any[],
          progress: {} as Record<string, any>
        };

        const userImageData: any[] = [];
        let projectProgress = {}

        if (project.assignedUsers && project.assignedUsers.length > 0) {
          project.assignedUsers.forEach(user => {
            this.userService.getUserById(user.userId).pipe(first()).subscribe((user: User) => {
              userImageData.push({id: user.id, img: '/assets/images/' + user.imagePath});
            });
          })
        }
        if (project.assignedTeams && project.assignedTeams.length > 0) {
          project.assignedTeams.forEach(team => {
            this.teamService.getTeamMembers(team.teamId).pipe(first()).subscribe((team: Team) => {
              this.teamService.getTeamUsers(team.members).pipe(first()).subscribe((user: User[]) =>
                user.map(user => userImageData.push({id: user.id, img: '/assets/images/' + user.imagePath}))
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
        })
        userObj.userImageData = userImageData
        userObj.progress = projectProgress
        _taskByUser.push(userObj)
      })
    }
    console.log("taskByUser", _taskByUser)
    return _taskByUser;
  });

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

  onRemoveParticipants(userImageData: {id: any, img: string}, $event: MouseEvent) {
    //should be able to remove team member/extra user
  }

  onAddParticipants(userImageData: {id: any, img: string}[], $event: MouseEvent) {
    // there should be a tab for add to team, add as extra
    // code any removal from team updates team db, removal from extra updates project db "assignedUser"
    this.listDataComponent = this.bottomSheet.createComponent(ListDataWrapperComponent);
    this.listDataComponent.instance.getData().length = 0;
    this.listDataComponent.instance.getData().push(...userImageData);
    this.listDataComponent.instance.projects().push(...this.projects());
    this.listDataComponent.instance.users().push(...this.users());
    //this.listDataComponent.setInput("users", this.users());
    //this.listDataComponent.instance.
    //this.projects.set()

    this.overlay.nativeElement.style.display = 'flex';
    this._bottomSheet.nativeElement.style.bottom = '0';

    console.log($event);
    $event.preventDefault();
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
    this.isExtraUser = !this.isTeamMember

    if (this.isTeamMember)
      console.log('team')
    else
      console.log('user')
  }
}
