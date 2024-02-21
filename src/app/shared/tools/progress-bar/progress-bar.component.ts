import {Component, input, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
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
