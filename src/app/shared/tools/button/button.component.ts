import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() color: any;
  @Input() addParticipant: boolean = false;
  @Input() btnMore:  boolean = false;
  @Input() viewBtn:  boolean = false;
  @Input() list:  boolean = false;
  @Input() grid:  boolean = false;
  @Input() active:  boolean = false;
  @Input() title: any;

  @Output() onClick = new EventEmitter<MouseEvent>();
}
