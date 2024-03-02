import {Component, CUSTOM_ELEMENTS_SCHEMA, inject} from '@angular/core';
import {CommonModule, DOCUMENT} from "@angular/common";
import {RouterModule, RouterOutlet} from "@angular/router";
import {ButtonComponent} from "../../tools/button/button.component";


@Component({
  selector: 'app-content-layout',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonComponent],
  templateUrl: './content-layout.component.html',
  styleUrl: './content-layout.component.css'
})
export class ContentLayoutComponent {
  document = inject(DOCUMENT);
  isDark: boolean = false;

  toggleDarkMode($event: MouseEvent) {
    this.isDark = !this.isDark;

    // Toggle the 'dark' class on the document's root element
    this.document.documentElement.classList.toggle('dark');
  }

}
