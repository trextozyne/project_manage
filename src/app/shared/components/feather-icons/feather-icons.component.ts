import {Component, OnInit, Input, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import * as feather from 'feather-icons';
import {CommonModule, isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-feather-icons',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './feather-icons.component.html',//
  //styleUrls: ['./feather-icons.component.scss']
  styles: [
    `
      svg {
        color: #c5bcbc;
        display: block;
      }

      .feather.feather-settings {
        position: relative;
        animation: glowAnimation 2s infinite linear;
        border-radius: 15px;
      }

      @keyframes glowAnimation {
        0% {
          box-shadow: 0 0 0 0 rgba(24, 77, 225, 0.84);
        }
        100% {
          box-shadow: 0 0 0 15px rgba(0, 191, 255, 0);
        }
      }
    `
  ]
})
export class FeatherIconsComponent implements OnInit {

  @Input('icon') public icon: any;
  @Input() public color: any;
  platformId: any;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit() {

    if(isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.color = this.color? this.color : '#c5bcbc';
        feather.replace();
      });
    }
  }

}
