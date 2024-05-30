import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  inject,
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';

/**
 * Load the implementations that should be tested
 */
import { DefinitivePaymentComponentTDD } from './definitive-payment-tdd.component';

describe(`DefinitivePaymentComponentTDD`, () => {
  let comp: DefinitivePaymentComponentTDD;
  let fixture: ComponentFixture<DefinitivePaymentComponentTDD>;

  /**
   * async beforeEach
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefinitivePaymentComponentTDD ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    })
    /**
     * Compile template and css
     */
    .compileComponents();
  }));

  /**
   * Synchronous beforeEach
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(DefinitivePaymentComponentTDD);
    comp    = fixture.componentInstance;

    /**
     * Trigger initial data binding
     */
    fixture.detectChanges();
  });

  it(`should be readly initialized`, () => {
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  });

  it('should log ngOnInit', () => {
    spyOn(console, 'log');
    expect(console.log).not.toHaveBeenCalled();

    expect(console.log).toHaveBeenCalled();
  });

});
