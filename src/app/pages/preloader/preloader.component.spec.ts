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
import { PreloaderComponent } from './preloader.component';

describe(`SummaryComponent`, () => {
  let comp: PreloaderComponent;
  let fixture: ComponentFixture<PreloaderComponent>;

  /**
   * async beforeEach
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreloaderComponent ],
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
    fixture = TestBed.createComponent(PreloaderComponent);
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
