import {Directive, ElementRef, HostListener, inject, Renderer2} from '@angular/core';

@Directive({
  selector: '[appBorderBottomEffect]',
  standalone: true
})
export class BorderBottomEffectDirective {
  private el = inject(ElementRef);
  private renderer = inject( Renderer2);
  private isAnimationInProgress = false;

  constructor() { }

  @HostListener('mouseover', ['$event'])
  onHover(event: MouseEvent): void {
    if (!this.isAnimationInProgress) {
      this.isAnimationInProgress = true;

      const borderBottomSpan = this.renderer.createElement('span');
      const rect = this.el.nativeElement.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      this.renderer.setStyle(borderBottomSpan, 'width', `${size}px`);
      this.renderer.addClass(borderBottomSpan, 'borderBottomSpan');
      this.renderer.appendChild(this.el.nativeElement, borderBottomSpan);

      borderBottomSpan.addEventListener('animationend', () => {
        this.isAnimationInProgress = false;
        borderBottomSpan.remove();
      });
    }
  }
}
