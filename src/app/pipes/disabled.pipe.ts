import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'disabled'
})
export class DisabledPipe implements PipeTransform {

  transform(moves: {[key: string]: any}, id: string, disabled: boolean, multiple: boolean): boolean {
    
    const elements = Object.keys(moves).length;
    
    // For multiple selction 
    if (multiple) {
      return false;
    } else {

      if (!Boolean(moves[id]) && disabled) {
        return true;
      }
      
      // There's no selection
      if (elements === 0) {
        return false;
      }

      if (Boolean(moves[id]) && elements <= 1) {
        return false;
      }
      
      if (elements >= 1) {
        return true;
      }
    }
  }

}
