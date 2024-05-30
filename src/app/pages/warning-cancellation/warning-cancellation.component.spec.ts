import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningCancellationComponent } from './warning-cancellation.component';

describe('WarningCancellationComponent', () => {
  let component: WarningCancellationComponent;
  let fixture: ComponentFixture<WarningCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarningCancellationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
