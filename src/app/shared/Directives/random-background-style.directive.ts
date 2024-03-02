import {Directive, HostBinding, Input} from '@angular/core';

@Directive({
  selector: '[appRandomBackgroundStyle]',
  standalone: true
})
export class RandomBackgroundStyleDirective {
  private colorStorageKey = 'colorStorageKey';
  private childColorStorageKey = 'childColorStorageKey';

  private colors: string[] = ['#dbf6fd', '#d5deff', '#fee4cb', '#e9e7fd', '#ffd3e2', '#c8f7dc'];//
  private childColors: string[] = ['#096c86', '#4067f9', '#ff942e', '#4f3ff0', '#df3670', '#34c471'];

  @HostBinding('style.background-color') backgroundColor: string = '';
  @HostBinding('style.color') childColor: string = '';

  @Input() isColor: boolean = false;
  @Input() isBgColor: boolean = false;
  @Input() isStart: boolean = false;

  ngOnInit() {
    if (this.isStart) this.shuffleColors();

    if (!this.isColor) {
      const storedColors = localStorage.getItem(this.colorStorageKey);
      if (storedColors)
        this.colors = JSON.parse(storedColors);

      this.backgroundColor = this.colors[0];
    } else {
      const storedColors = localStorage.getItem(this.childColorStorageKey);

      if (storedColors) {
        this.childColors = JSON.parse(storedColors);
        if (!this.isBgColor)
          this.childColor = this.childColors[0];
        else
          this.backgroundColor = this.childColors[0];
      }
    }
  }

  private shuffleColors(): void {
    // Fisher-Yates (aka Knuth) Shuffle
    let currentIndex = this.colors.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [this.colors[currentIndex], this.colors[randomIndex]] = [this.colors[randomIndex], this.colors[currentIndex]];
      [this.childColors[currentIndex], this.childColors[randomIndex]] = [this.childColors[randomIndex], this.childColors[currentIndex]];
    }
    this.saveColors();
  }

  private saveColors(): void {
    localStorage.setItem(this.colorStorageKey, JSON.stringify(this.colors));
    localStorage.setItem(this.childColorStorageKey, JSON.stringify(this.childColors));
  }

}
