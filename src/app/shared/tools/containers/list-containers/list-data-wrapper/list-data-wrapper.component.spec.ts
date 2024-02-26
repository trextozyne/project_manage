import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDataWrapperComponent } from './list-data-wrapper.component';

describe('ListDataWrapperComponent', () => {
  let component: ListDataWrapperComponent;
  let fixture: ComponentFixture<ListDataWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDataWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListDataWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
