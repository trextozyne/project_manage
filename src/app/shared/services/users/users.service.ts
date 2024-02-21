import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {switchMap} from "rxjs/operators";
import {User} from "../../models/user";
import {Observable} from "rxjs";

export interface Users {
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  http = inject(HttpClient)

  constructor() { }

  getUsers():Observable<Users> {
    return this.http.get<Users>('/assets/data/users.json'); // without http://localhost:... will cause ERROR NetworkError at send (./node_modules/xhr2/lib/xhr2.js:281:19)
  }

  getUserById(id: any) {
    return this.getUsers().pipe(
      switchMap((users: Users) => users.users.filter(user => user.id === id)),
    );
  }
}
