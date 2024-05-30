import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-move-list',
  template: `
    <ul class="m-list">
      <ng-content></ng-content>
    </ul>
  `
})
export class MoveListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
