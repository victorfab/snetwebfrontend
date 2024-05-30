import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeferPurchaseComponent } from './defer-purchase.component';

describe('DeferPurchaseComponent', () => {
  let component: DeferPurchaseComponent;
  let fixture: ComponentFixture<DeferPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeferPurchaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeferPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
