import {computed, effect, inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, scan, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {User} from "../../models/user";
import {ReplaySubject, of} from "rxjs";

export interface Users {
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  http = inject(HttpClient)

  private userDataCache$ = new ReplaySubject<Users>(1);

  constructor() {
    //this.projectDataCache$ = this.fetchUsersData();
    effect((onCleanup) => {
      const sub = this.fetchUsersData().pipe(
        catchError(error => {
          console.error('Error fetching users', error);
          return [];
        })
      ).subscribe((users: Users) => {
        this.userDataCache$.next(users);
        this.userDataCache$.complete();//must run complete
      });
      onCleanup(()=> sub.unsubscribe())
    });
  }

  private fetchUsersData() {
    return this.http.get<Users>('/assets/data/users.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  updateUserData(): void {
    this.fetchUsersData();
  }

  getUsers() {
    return this.userDataCache$;
  };

  getUserById(id: any) {
    return this.getUsers().asObservable().pipe(
      switchMap((users: Users) => users.users.filter(user => user.id === id)),
    );
  }
}
