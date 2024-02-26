import {computed, effect, inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UsersService} from "../users/users.service";
import {of, ReplaySubject} from "rxjs";
import {catchError, map, mergeAll, mergeMap, toArray} from "rxjs/operators";
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

  teams: Teams = <Teams>{};
  private teamDataCache$ = new ReplaySubject<Teams>(1);

  constructor() {
    //this.TeamDataCache$ = this.fetchTeamData();
    effect((onCleanup) => {
      const sub = this.fetchTeamData().pipe(
        catchError(error => {
          console.error('Error fetching Teams', error);
          return [];
        })
      ).subscribe((teams: Teams) => {
        this.teamDataCache$.next(teams);
        this.teamDataCache$.complete();
      });
      onCleanup(()=> sub.unsubscribe())
    });
  }

  private fetchTeamData() {
    return this.http.get<Teams>('/assets/data/teams.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  updateTeamData(): void {
    this.fetchTeamData();
  }

  getTeams = computed(()=> {
    return this.teamDataCache$;
  });

  getTeamMembers(id: any) {
    return this.getTeams().pipe(
      map((teams: Teams) => teams.teams.filter(team => team.teamId === id)[0])
    );
  }

  getTeamUsers(members: { userId: any }[]) {
    return  of(members).pipe(
      mergeAll(), // flatten to Observable<Something>
      mergeMap((p: { userId: any }) =>
          this.userService.getUserById(p.userId).pipe(map((user: User) => ({...user})))// back to Observable<User[]>
      ),
      toArray()
    );
  }
}
