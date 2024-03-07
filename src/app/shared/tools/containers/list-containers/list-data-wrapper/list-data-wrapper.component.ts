import {Component, computed, EventEmitter, inject, input, Output, signal} from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {CommonModule} from "@angular/common";
import {UsersService} from "../../../../services/users/users.service";
import {ProjectsService} from "../../../../services/projects/projects.service";
import {Project} from "../../../../models/project";
import {User} from "../../../../models/user";
import {RippleEffectDirective} from "../../../../Directives/ripple-effect.directive";
import {BorderBottomEffectDirective} from "../../../../Directives/border-bottom-effect.directive";
import {first, map, switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";
import {TaskPerUser} from "../../../../models/taskPerUser";

@Component({
  selector: 'app-list-data-wrapper',
  standalone: true,
  imports: [CommonModule, MatListModule, RippleEffectDirective, BorderBottomEffectDirective],
  templateUrl: './list-data-wrapper.component.html',
  styleUrl: './list-data-wrapper.component.css'
})
export class ListDataWrapperComponent {
  userService = inject(UsersService);
  projectService = inject(ProjectsService);

  projects = input<Project[]>([]);
  users = input<User[]>([]);


  getData = input<{ id: any; isAssignedToTeam: boolean; img: string }[]>([]);

  projectId = signal<any>(undefined)

  isUserToTeam = signal<boolean>(true);

  isAddUser = signal<boolean>(true);

  @Output() emitChosenUser: EventEmitter<{id: any, isAssignedToTeam: boolean, img: string}> = new EventEmitter<{id: any, isAssignedToTeam: boolean, img: string}>()

  getAddImage = computed(() => {

    //for remove user ops, return the getData and shuffle based on tab click isAssingedTeam/user,
    //set in map this.isAssignedToTeam to true or false based on tab select
    return this.isAddUser()
      ?
      this.users().filter((user)=> !this.getData()?.some((userData) => user.id === userData.id))
      .map((user: User) => ({id: user.id, isAssignedToTeam: this.isUserToTeam(), img: '/assets/images/' + user.imagePath}))
      :
      this.isUserToTeam()
      ?
      this.getData().filter(userData => userData.isAssignedToTeam)
      :
      this.getData().filter(userData => !userData.isAssignedToTeam);
  })

  constructor() {  }

  onUserClick(userData: {id: any, isAssignedToTeam: boolean, img: string}, event: MouseEvent): void {
    this.emitChosenUser.emit(userData);

    event.preventDefault();
  }

  updateProject(selectedUserTasks: TaskPerUser[]) {
    debugger;
    const projectId$ = of(this.projectId());
    console.log("isUserToTeam", this.isUserToTeam())
    //if is add user to team fxn else remove user from team func
    //send changes to service to add user changes to Team or Single User
    if (this.isAddUser())
      if (this.isUserToTeam())
        projectId$.pipe(first()).subscribe(id => this.projectService.addUserToAssignedTeams(id, selectedUserTasks));
      else
        projectId$.pipe(first()).subscribe(id => this.projectService.addUserToAssignedUsers(id, selectedUserTasks));
    else
      if (this.isUserToTeam())
        projectId$.pipe(first()).subscribe(id => this.projectService.removeUserFromAssignedTeams(id, selectedUserTasks));
      else
        projectId$.pipe(first()).subscribe(id => this.projectService.removeUserFromAssignedUsers(id, selectedUserTasks));
  }


  updateProjectAssignmentHistory(selectedUserTasks: TaskPerUser[]) {
    debugger;
    const projectId$ = of(this.projectId());
    console.log("isUserToTeam", this.isUserToTeam())
    if (this.isAddUser())
      if (this.isUserToTeam())
        // repopulate the user task based on restored from assignment history data
        projectId$.pipe(first()).subscribe(id => this.projectService.repopulateUserTaskWithHistory(id, selectedUserTasks));
    else
      if (this.isUserToTeam())
        // insert to assignment history arry
        projectId$.pipe(first()).subscribe(id => this.projectService.updateAssignmentHistoryWithRemovedUser(id, selectedUserTasks));
  }
}
