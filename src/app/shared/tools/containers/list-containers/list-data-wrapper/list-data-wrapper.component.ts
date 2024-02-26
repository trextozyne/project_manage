import {Component, computed, effect, inject, input, Input, signal, SimpleChanges} from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {CommonModule} from "@angular/common";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {map, switchMap} from "rxjs/operators";
import {Users, UsersService} from "../../../../services/users/users.service";
import {Projects, ProjectsService} from "../../../../services/projects/projects.service";
import {Project} from "../../../../models/project";
import {User} from "../../../../models/user";
import {RippleEffectDirective} from "../../../../Directives/ripple-effect.directive";
import {BorderBottomEffectDirective} from "../../../../Directives/border-bottom-effect.directive";

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
  //@Input() getData!: { id: any; img: string }[];

  getData = input<{ id: any; img: string }[]>([]);

  getAddImage = computed(() => {
    console.log("listi", this.users())
    return this.users().filter((user)=> !this.getData()?.some((userData) => user.id === userData.id))
      .map((user: User) => ({id: user.id, img: '/assets/images/' + user.imagePath}));
  })

  constructor() {  }

  openLink(event: MouseEvent): void {
    event.preventDefault();
  }
}
