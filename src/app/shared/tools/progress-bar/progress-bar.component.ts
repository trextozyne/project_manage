import {Component, input, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FullDatePipePipe} from "../../pipes/full-date-pipe.pipe";
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
  // @Input() progress_count: any
  progress_count = input.required<number>()
  width: number = 0;

  ngOnInit() {
    setTimeout(()=>{
      this.width = this.progress_count();
    }, 2000)
  }
}
