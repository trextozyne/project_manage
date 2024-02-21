import { Pipe, PipeTransform } from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({
  name: 'fullDatePipe',
  standalone: true
})
export class FullDatePipePipe implements PipeTransform {

  transform(value: string | Date): string {
    const datePipe = new DatePipe('en-US');
    return <string>datePipe.transform(value, 'MMMM d, y');
  }

}
