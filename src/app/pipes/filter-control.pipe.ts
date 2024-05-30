import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterControl'
})
export class FilterControlPipe implements PipeTransform {

  transform(list: any[]): any[] {
    if (!list) {
      return [];
    }
    return list.filter((ctrl) => ctrl.show);
  }

}
