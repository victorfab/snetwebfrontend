import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  constructor() { }

  public showTooltip(event, id) {
    console.log(event);
    console.log(id);
    // Define tooltipeText
    let text = "";
    switch (id) {
      case 1:
        text =
          "Por favor toque “x” para eliminar un movimiento que ya no desee mandar a aclarar.";
        break;
      case 2:
        text =
          "Es importante señalar que se pueden aclarar movimientos de hasta 3 meses anteriores a la fecha actual.";
        break;
      case 3:
        text = "Retiros en cajero automático";
        break;
      case 4:
        text = "Compras en locales o centros comerciales";
        break;
      default: "Error"
        break;
    }

    const y = event.clientY;
    const x = event.clientX;
    const tooltip = document.getElementById('tooltip-box');
    const backdrop = document.getElementById('backdrop');
    const tooltipText = document.getElementById('tooltip-text');
    const flagBorder = document.getElementById('flag-border');
    const flagColor = document.getElementById('flag-color');

    tooltipText.innerHTML = text;
    tooltip.style.top = (y + 20) + 'px';
    tooltip.style.position = 'fixed';
    flagColor.style.left = (x - 14) + 'px';
    flagBorder.style.left = (x - 14) + 'px';
    backdrop.classList.remove('tooltip-hide');
    tooltip.classList.remove('tooltip-hide');

  }

}
