import {Component, EventEmitter, input, Input, InputSignal, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RandomBackgroundStyleDirective} from "../../Directives/random-background-style.directive";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RandomBackgroundStyleDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  modeSwitch:  InputSignal<boolean> =  input<boolean>(false);
  addPjtBtn:  InputSignal<boolean> =  input<boolean>(false);
  notificationBtn:  InputSignal<boolean> =  input<boolean>(false);
  profileBtn:  InputSignal<boolean> =  input<boolean>(false);
  messagesBtn:  InputSignal<boolean> =  input<boolean>(false);
  noBgBorder: InputSignal<boolean>  = input<boolean>(false);
  participant: InputSignal<boolean> =  input<boolean>(false);
  color: InputSignal<any> =  input<boolean>();
  title: InputSignal<any> =  input<boolean>();
  btnMore:  InputSignal<boolean> =  input<boolean>(false);
  viewBtn:  InputSignal<boolean> =  input<boolean>(false);
  list:  InputSignal<boolean> =  input<boolean>(false);
  grid:  InputSignal<boolean> =  input<boolean>(false);
  active:  InputSignal<boolean> =  input<boolean>(false);

  @Output() onClick = new EventEmitter<MouseEvent>();
}
