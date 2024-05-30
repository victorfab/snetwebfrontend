import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsTddComponent } from './alerts-tdd.component';

describe('AlertsTddComponent', () => {
  let component: AlertsTddComponent;
  let fixture: ComponentFixture<AlertsTddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertsTddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsTddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});