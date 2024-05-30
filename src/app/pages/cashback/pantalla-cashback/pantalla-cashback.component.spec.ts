import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaCashbackComponent } from './pantalla-cashback.component';

describe('PantallaCashbackComponent', () => {
  let component: PantallaCashbackComponent;
  let fixture: ComponentFixture<PantallaCashbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PantallaCashbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaCashbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
