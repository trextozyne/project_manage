
## task code

### With RXJS
```typescript
taskByUser = computed(() => {
    return from(this.projects()).pipe(
      mergeMap((project: Project) => {
        const userImages$ = forkJoin(
          (project.assignedUsers || []).map(user =>
            this.userService.getUserById(user.userId).pipe(first(), map((user: User) => user.imagePath))
          ),
          (project.assignedTeams || []).map(team =>
            this.teamService.getTeamMembers(team.teamId).pipe(
              first(),
              mergeMap((team: Team) =>
                this.teamService.getTeamUsers(team.members).pipe(
                  first(),
                  map((users: User[]) => users.map(user => user.imagePath))
                )
              )
            )
          )
        );

        const projectProgress$ = this.projectService.getUserProgress(project.userProgress).pipe(first());

        const userTasks$ = from(project.userProgress).pipe(
          map(user => ({
            projectName: this.projectService.getProjectById(project.projectId),
            projectTask: this.projectService.getProjectLevelTask(user.taskId, project.tasks)?.name,
            userTask: this.projectService.getUserLevelTask(project.tasks, user.task),
          }))
        );

        return forkJoin(userImages$, projectProgress$, userTasks$).pipe(
          map(([userImages, projectProgress, userTasks]) => {
            const userObj = {
              userImages: userImages.flat(),
              progress: projectProgress,
              ...userTasks
            };
            console.log(userObj)
            return userObj;
          })
        );
      }),
      toArray()
    );
  });
```

### Another With Promises
```typescript
taskByUser = computed(() => {
  const _taskByUser: any[] = [];

  if (this.projects().length) {
    this.projects().forEach(async (project: Project) => {
      const userObj = {} as any;
      const userImages: any[] = await this.getUserImages(project);
      const projectProgress = await this.getProjectProgress(project);

      userObj.projectName = this.projectService.getProjectById(project.projectId);
      userObj.projectTask = this.projectService.getProjectLevelTask(user.taskId, project.tasks)?.name;
      userObj.userTask = this.projectService.getUserLevelTask(project.tasks, user.task);
      userObj.userImages = userImages;
      userObj.progress = projectProgress;

      _taskByUser.push(userObj);
    });
  }

  console.log("taskByUser", _taskByUser);
  return _taskByUser;
});

private async getUserImages(project: Project): Promise<any[]> {
  const userImages: any[] = [];

  if (project.assignedUsers && project.assignedUsers.length > 0) {
    const users = await forkJoin(project.assignedUsers.map(user => this.userService.getUserById(user.userId).pipe(first())));
    users.forEach(user => userImages.push(user.imagePath));
  }

  if (project.assignedTeams && project.assignedTeams.length > 0) {
    const teamMembers = await forkJoin(project.assignedTeams.map(team => this.teamService.getTeamMembers(team.teamId).pipe(first())));
    const teamUsers = await forkJoin(teamMembers.map(team => this.teamService.getTeamUsers(team.members).pipe(first())));
    teamUsers.forEach(users => users.map(user => userImages.push(user.imagePath)));
  }

  return userImages;
}

private async getProjectProgress(project: Project): Promise<{ totalCompletedTasks: number, totalTasks: number, progressPercentage: number }> {
  return await this.projectService.getUserProgress(project.userProgress).pipe(first()).toPromise();
}

```
