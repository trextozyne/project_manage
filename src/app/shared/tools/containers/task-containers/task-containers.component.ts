import {Component, ElementRef, input, ViewChild, OnChanges, ViewChildren, QueryList} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RandomBackgroundStyleDirective} from "../../../Directives/random-background-style.directive";
import {MatExpansionModule, MatExpansionPanel} from "@angular/material/expansion";
import {ProgressBarComponent} from "../../progress-bar/progress-bar.component";
import {taskPerUser} from "../../../services/projects/projects.service";

@Component({
  selector: 'app-task-containers',
  standalone: true,
  imports: [CommonModule, RandomBackgroundStyleDirective, MatExpansionModule, ProgressBarComponent],
  templateUrl: './task-containers.component.html',
  styleUrl: './task-containers.component.css'
})
export class TaskContainersComponent {
  panelOpenState:  boolean = false; //accordion
  @ViewChild('mat_exp') matExpansionPanel!: MatExpansionPanel;
  //@ViewChild('participants') participants!: ElementRef;
  @ViewChildren('participants') participants!: QueryList<ElementRef>;

  // ==for single user  dropdown===
  userImages = input<{id: string, isAssignedToTeam: boolean, img: string}[]>();
  taskPerUser = input<taskPerUser[]>();

  ngOnChanges() {
    // Check if the element array is empty and toggle the expansion panel accordingly
    const isEmpty = this.participants && this.participants.length === 1;

    if (isEmpty)
      this.matExpansionPanel.close();
  }

  constructor() {
  }
}
