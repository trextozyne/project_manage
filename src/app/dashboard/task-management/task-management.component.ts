import {Component, computed, effect, inject, signal} from '@angular/core';
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

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent,
    TaskContainersComponent, ButtonComponent, DaymonthpipePipe],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css'
})
export class TaskManagementComponent {
  projectService = inject(ProjectsService);
  userService = inject(UsersService);
  teamService = inject(TeamsService);

  currentDate: Date = new Date();
  projects = signal<Project[]>([]);
  users = signal<User[]>([]);

  private projects$: Observable<Projects> = this.projectService.getProjects();
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
        const userObj = {} as any;
        const userImages: any[] = [];
        let projectProgress = {}

        if (project.assignedUsers && project.assignedUsers.length > 0) {
          project.assignedUsers.forEach(user => {
            this.userService.getUserById(user.userId).pipe(first()).subscribe((user: User) => {
              userImages.push(user.imagePath);
            });
          })
        }
        if (project.assignedTeams && project.assignedTeams.length > 0) {
          project.assignedTeams.forEach(team => {
            this.teamService.getTeamMembers(team.teamId).pipe(first()).subscribe((team: Team) => {
              this.teamService.getTeamUsers(team.members).pipe(first()).subscribe((user: User[]) => {
                user.map(user => userImages.push(user.imagePath));
              })
            })
            console.log("images:", userImages);
          })
        }
        this.projectService.getUserProgress(project.userProgress).pipe(first()).subscribe(($projectProgress: { totalCompletedTasks: number, totalTasks: number, progressPercentage: number }) => {
          projectProgress = $projectProgress;
        })
        project.userProgress.forEach(user => {
          userObj.projectName = this.projectService.getProjectById(project.projectId);

          userObj.projectTask = this.projectService.getProjectLevelTask(user.taskId, project.tasks)?.name;

          userObj.userTask = this.projectService.getUserLevelTask(project.tasks, user.task);
        })
        userObj.userImages = userImages
        userObj.progress = projectProgress
        _taskByUser.push(userObj)
      })
    }
    console.log("taskByUser", _taskByUser)
    return _taskByUser;
  });

  ngOnInit() {

  }

  constructor() {
    effect((onCleanup)=> {
      const sub = this.projectService.getProjects().subscribe((projects: Projects) => {
        console.log(projects)
        this.projects.set(projects.projects);
      });
      onCleanup (()=> sub.unsubscribe)
    })

    effect((onCleanup)=> {
      const sub = this.userService.getUsers().subscribe((users: Users) => {
        console.log(users)
        this.users.set(users.users);
      });
      onCleanup (()=> sub.unsubscribe)
    })
  }

  onAddParticipants($event: MouseEvent) {
    console.log($event);
  }
}
