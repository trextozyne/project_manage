import {Component, computed, input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ProgressCountModifierPipe} from "../../pipes/progress-count-modifier.pipe";
import {RandomBackgroundStyleDirective} from "../../Directives/random-background-style.directive";

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, ProgressCountModifierPipe, RandomBackgroundStyleDirective],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {
  progress_count = input.required<number>()
  width = computed(() => this.progress_count());
}
