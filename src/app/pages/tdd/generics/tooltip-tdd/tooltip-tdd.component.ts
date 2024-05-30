import { Component, HostListener, OnInit } from '@angular/core';

/**
 *
 *
 * @export
 * @class TooltipTddComponent
 */
@Component({
  selector: 'app-tooltip-tdd',
  templateUrl: './tooltip-tdd.component.html'
})
export class TooltipTddComponent implements OnInit {

  /**
   * Creates an instance of TooltipTddComponent.
   * @memberof TooltipTddComponent
   */
  constructor() {
  }

  ngOnInit(): void {
  }

  /**
   *
   *
   * @param {*} $event
   * @memberof TooltipTddComponent
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    this.hideTooltip()
  }

  /**
   * method that changes the dom and show the tooltip
   *
   * @param {*} event
   * @param {string} text
   * @memberof TooltipTddComponent
   */
  showTooltip(event: any, text: string) {
    const y = event.clientY;
    const x = event.clientX;
    const tooltip = document.getElementById('tooltip-tdd-box');
    const backdrop = document.getElementById('tooltip-tdd-backdrop');
    const tooltipText = document.getElementById('tooltip-text');
    const flagBorder = document.getElementById('tooltip-tdd-flag-border');
    const flagColor = document.getElementById('tooltip-tdd-flag-color');

    tooltipText.innerHTML = text;
    if (text.indexOf('x') > 0) {
      tooltipText.classList.add('tooltip-text');
    }

    tooltip.style.top = (y + 20 + window.scrollY) + 'px';
    tooltip.style.position = 'absolute';
    flagColor.style.left = (x - 14) + 'px';
    flagBorder.style.left = (x - 14) + 'px';
    backdrop.classList.remove('tooltip-hide');
    tooltip.classList.remove('tooltip-hide');
  }

  /**
   * method that changes the dom and hides the tooltip
   *
   * @memberof TooltipTddComponent
   */
  hideTooltip() {
    const tooltip = document.getElementById('tooltip-tdd-box');
    const backdrop = document.getElementById('tooltip-tdd-backdrop');
    backdrop?.classList?.add('tooltip-hide');
    tooltip?.classList?.add('tooltip-hide');
    backdrop?.classList?.add('tooltip-hide');
  }

}
