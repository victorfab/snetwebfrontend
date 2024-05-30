import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { TaggingService } from '../../../services/tagging.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {


  @Input() movesIndicator = 0;

  @Input() getProduct = false;

  clacon: number = 2060;
  toggleId: string = '';

  public showMoves = false;


  constructor(private ts: TaggingService) { }

  ngOnInit(): void {
  }

  public toggle(): void {
    this.showMoves = !this.showMoves;
  }

  public tagAction(): void {
    this.ts.link({
      event: "aclaraciones",
      interaction_action: "listado_movimientos",
      interaction_category: "detalle_movimientos",
      interaction_label: "listado_movimientos",
    });
  }
}
