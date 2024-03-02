import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressCountModifier',
  standalone: true
})
export class ProgressCountModifierPipe implements PipeTransform {

  transform(inputString: string | null): string {
    if (inputString) {
      const match = inputString.match(/^\d{1,5}|\d{0,5}\.\d{1,2}$/g);

      // Check if the pattern is matched
      if (match && match[1] === '.00') {
        // Return the modified string
        return match[0];
      } else {
        // Return the original string if it doesn't match the criteria
        return inputString;
      }
    }
    return '';
  }

}
