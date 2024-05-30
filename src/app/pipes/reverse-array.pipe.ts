import { Pipe, PipeTransform } from '@angular/core';
/**
 *reverse an array
 *
 * @export
 * @class ReverseArrayPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'reverse',
  pure: false
})
export class ReverseArrayPipe implements PipeTransform {

    public transform (values) {
      return values.reverse();
    }
}
