import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.component.html',
})
export class InfoListComponent implements OnInit {

  @Input() sections = [];

  constructor() { }

  ngOnInit(): void { }

}
