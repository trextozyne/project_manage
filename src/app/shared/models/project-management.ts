

// project-management.model.ts
import {Project} from "./project";
import {User} from "./user";
import {Team} from "./team";

export interface ProjectManagement {
  users: User[];
  teams: Team[];
  projects: Project[];
}

