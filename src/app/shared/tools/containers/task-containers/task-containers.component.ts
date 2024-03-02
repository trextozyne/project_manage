import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {RandomBackgroundStyleDirective} from "../../../Directives/random-background-style.directive";
import {MatExpansionModule} from "@angular/material/expansion";
import {ProgressBarComponent} from "../../progress-bar/progress-bar.component";

@Component({
  selector: 'app-task-containers',
  standalone: true,
  imports: [CommonModule, RandomBackgroundStyleDirective, MatExpansionModule, ProgressBarComponent],
  templateUrl: './task-containers.component.html',
  styleUrl: './task-containers.component.css'
})
export class TaskContainersComponent {
  panelOpenState:  boolean = false; //accordion

}
