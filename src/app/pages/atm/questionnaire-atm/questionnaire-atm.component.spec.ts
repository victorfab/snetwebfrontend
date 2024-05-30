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
import { QuestionnaireATMComponent } from './questionnaire-atm.component';

describe(`QuestionnaireATMComponent`, () => {
  let comp: QuestionnaireATMComponent;
  let fixture: ComponentFixture<QuestionnaireATMComponent>;

  /**
   * async beforeEach
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnaireATMComponent ],
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
    fixture = TestBed.createComponent(QuestionnaireATMComponent);
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
