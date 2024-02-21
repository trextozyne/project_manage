import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UsersService} from "../users/users.service";
import {of} from "rxjs";
import {map, mergeAll, mergeMap, toArray} from "rxjs/operators";
import {User} from "../../models/user";
import {Team} from "../../models/team";

export interface Teams {
  teams: Team[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  http = inject(HttpClient)

  userService = inject(UsersService)

  constructor() { }

  getTeams(){
    return this.http.get<Teams>('/assets/data/teams.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  getTeamMembers(id: any) {
    return this.getTeams().pipe(
      map((teams: Teams) => teams.teams.filter(team => team.teamId === id)[0])
    );
  }

  getTeamUsers(members: { userId: any }[]) {
    return of(members).pipe(
      mergeAll(), // flatten to Observable<Something>
      mergeMap((p: { userId: any }) =>
        this.userService.getUserById(p.userId).pipe(map((user: User) => ({ ...user})))// back to Observable<User[]>
      ),
      toArray()
    );
  }
}
