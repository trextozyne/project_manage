import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskContainersComponent } from './task-containers.component';

describe('TaskContainersComponent', () => {
  let component: TaskContainersComponent;
  let fixture: ComponentFixture<TaskContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskContainersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
