import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysleft',
  standalone: true
})
export class DaysleftPipe implements PipeTransform {

  transform(value: string | Date): string {
    const now = new Date();
    const targetDate = new Date(value);
    const timeDiff = targetDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return `${daysLeft} Days Left`;
  }

}
