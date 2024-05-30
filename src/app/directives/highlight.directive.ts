import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  /**
   * The word to search within word input
   * @Input
   */
  @Input() set query(query: string) {
    this.processQuery(query);
  }

  /**
   * The word to search in
   * @Input
   */
  @Input() word = '';

  constructor(private el: ElementRef) {
    if (Boolean(this.el)) {
      this.el.nativeElement.innerHTML = this.word;
    }
  }

  /**
   * 
   * @param {string} query - The word to search
   * @void
   */
  private processQuery(query: string): void {
    let result = '';
    if (query.length > 0) {
      result = this.word.replace(new RegExp(query, 'gi'), (match) => {
        return `<span class="bold">${match}</span>`;
      });
    } else {
      result = this.word;
    }

    if (Boolean(this.el)) {
      this.el.nativeElement.innerHTML = result;
    }
  }

}
