import {Directive, ElementRef, HostListener, inject, Renderer2} from '@angular/core';

@Directive({
  selector: '[appRippleEffect]',
  standalone: true
})
export class RippleEffectDirective {
  private el = inject(ElementRef);
  private renderer = inject( Renderer2);
  constructor() { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const ripple = this.renderer.createElement('span');
    const rect = this.el.nativeElement.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${event.clientX - rect.left - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${event.clientY - rect.top - size / 2}px`);

    this.renderer.addClass(ripple, 'ripple');
    this.renderer.appendChild(this.el.nativeElement, ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }
}
