import "reflect-metadata";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule, ApplicationRef, LOCALE_ID } from "@angular/core";
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer,
} from "@angularclass/hmr";
import { RouterModule, PreloadAllModules } from "@angular/router";
import { BarRatingModule } from "ngx-bar-rating";
import moment from "moment";
import { NgxCurrencyModule } from "ngx-currency";

/* Platform and Environment providers/directives/pipes */
import { ENV_PROVIDERS } from "./environment";
import { ROUTES } from "./app.routes";
// App is our top level component
import { AppComponent } from "./app.component";
import { AppServiceComponent, AppInternalStateType } from "./shared";

import {
  PreloaderComponent,
  WelcomeComponent,
  QuestionnaireComponent,
  HistoryComponent,
  SummaryComponent,
  ResultComponent,
  NoContentComponent,
  NoConnectionComponent,
  LockedComponent,
  DefinitivePaymentComponent,
  QuestionnaireATMComponent,
  SummaryATMComponent,
  ResultATMComponent,
  HeaderComponent,
  PantallaCashbackComponent
} from './pages';
// TDD imports components
import {
  WelcomeTddComponent,
  QuestionnaireTddComponent,
  AlertsTddComponent,
  FooterTddComponent,
  SteperTddComponent,
  TooltipTddComponent,
  LockedTddComponent,
  ResultTddComponent,
  SpinnerTddComponent,
  SummaryTddComponent,
  PreloaderTddComponent,
  DefinitivePaymentComponentTDD,
} from "./pages/tdd/";

// sTORAGE FOR TDD
// partials imports
import {
  FooterComponent,
  LoaderComponent,
  AlertComponent,
  QualityRatingComponent,
} from "./partials";
import {
  KeysPipe,
  CustomCurrencyPipe,
  CustomCurrencyPlain,
  CustomMovesDate,
  MaskingPan,
  CurrencySmallCentsPipe,
  ReverseArrayPipe,
  FormatSmDatePipe,
  FormatSwDatePipe,
} from "./pipes";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ModalModule } from "ngx-bootstrap/modal";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

import { DefaultRequestOptions } from "./services/default-request-options.service";
import { ConstantsService } from "./services/constants.service";
import { LabelsService } from "./services/labels.service";
import { DataService } from "./services/data.service";
import { TaggingService } from "./services/tagging.service";

/* TDD Services Impots*/
// import { StorageService } from './services/tdd/storage.service';
// import { MainService } from './services/tdd/main.service';
import { UtilsTddService } from "./services/tdd/utils-tdd.service";
import { UtilsService } from "./services/utils.service";
import { SessionStorageService } from "./services/tdd/session-storage.service";
/* Declarations */
/* Directives */
import { DebounceClickDirective } from "./directives/debounce-click/debounce-click.directive";

import "./styles/styles.scss";

/* Alerts */
import { AlertsTddService } from './services/tdd/alerts-tdd.service';
import { AngularWebStorageModule } from 'angular-web-storage';
import { MovementComponent } from './partials/movement/movement.component';
import { HighlightDirective } from './directives/highlight.directive';
import { MessagesComponent } from './partials/messages/messages.component';
import { DisabledPipe } from './pipes/disabled.pipe';
import { FilterComponent } from './pages/tdd/generics/filter/filter.component';
import { SelectedMovesComponent } from './partials/selected-moves/selected-moves.component';
import localeEs from "@angular/common/locales/es";
import { registerLocaleData } from '@angular/common';
import { TabsComponent } from './partials/tabs/tabs.component';
import { FilterPipe } from './pipes/filter.pipe';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './pages/generics/bottom-sheet/bottom-sheet.component';
import { FormComponent } from './partials/form/form.component';
import { FilterControlPipe } from './pipes/filter-control.pipe';
import { PropsDirective } from './directives/props.directive';
import { DynamicQuestionnaireComponent } from './pages/dynamic-questionnaire/dynamic-questionnaire.component';
import { CardDetailComponent } from './partials/card-detail/card-detail.component';
import { FlAlertComponent } from './partials/fl-alert/fl-alert.component';
import { HeaderTicketV2Component, TicketUserData } from './partials/header-ticket/header-ticket.component';
import { DeferPurchaseComponent } from './pages/defer-purchase/defer-purchase.component';
import { MoveItemComponent } from './partials/move-item/move-item.component';
import { WarningCancellationComponent } from './pages/warning-cancellation/warning-cancellation.component';
import { LinexComponent } from './pages/linex/linex.component';
import { MoveListComponent } from './partials/move-list/move-list.component';
import { MoveListFilterPipe } from './pipes/move-list-filter.pipe';
import { Utils } from './shared/utils';
registerLocaleData(localeEs, 'es');
import { NavigationService } from "./services/navigation.service/navigation.service";
import { RequirementListComponent } from './partials/requirement-list/requirement-list.component';
import { InfoListComponent } from './partials/info-list/info-list.component';

// Application wide providers
const APP_PROVIDERS = [AppServiceComponent];

type StoreType = {
  state: AppInternalStateType;
  restoreInputValues: () => void;
  disposeOldHosts: () => void;
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    PreloaderComponent,
    WelcomeComponent,
    FooterComponent,
    LoaderComponent,
    AlertComponent,
    QualityRatingComponent,
    QuestionnaireComponent,
    SummaryComponent,
    HistoryComponent,
    ResultComponent,
    NoContentComponent,
    NoConnectionComponent,
    LockedComponent,
    DefinitivePaymentComponent,
    CustomCurrencyPipe,
    CustomCurrencyPlain,
    CustomMovesDate,
    CurrencySmallCentsPipe,
    MaskingPan,
    KeysPipe,
    ReverseArrayPipe,
    FormatSmDatePipe,
    FormatSwDatePipe,
    DebounceClickDirective,
    WelcomeTddComponent,
    QuestionnaireTddComponent,
    AlertsTddComponent,
    FooterTddComponent,
    SteperTddComponent,
    TooltipTddComponent,
    LockedTddComponent,
    ResultTddComponent,
    SpinnerTddComponent,
    SummaryTddComponent,
    PreloaderTddComponent,
    DefinitivePaymentComponentTDD,
    QuestionnaireATMComponent,
    SummaryATMComponent,
    ResultATMComponent,
    MovementComponent,
    HighlightDirective,
    MessagesComponent,
    DisabledPipe,
    HeaderComponent,
    PantallaCashbackComponent,
    FilterComponent,
    SelectedMovesComponent,
    TabsComponent,
    FilterPipe,
    BottomSheetComponent,
    FormComponent,
    FilterControlPipe,
    PropsDirective,
    DynamicQuestionnaireComponent,
    CardDetailComponent,
    FlAlertComponent,
    HeaderTicketV2Component,
    DeferPurchaseComponent,
    MoveItemComponent,
    WarningCancellationComponent,
    MoveListComponent,
    LinexComponent,
    MoveListFilterPipe,
    RequirementListComponent,
    TicketUserData,
    InfoListComponent,
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularWebStorageModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    RouterModule.forRoot(ROUTES, {useHash: true, preloadingStrategy: PreloadAllModules,  scrollPositionRestoration: 'top'}),
    BarRatingModule,
    MatBottomSheetModule
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    ConstantsService,
    LabelsService,
    UtilsTddService,
    UtilsService,
    Utils,
    SessionStorageService,
    DataService,
    {provide: 'moment', useValue: moment},
    {provide: LOCALE_ID, useValue: 'es'},
    TaggingService,
    AlertsTddService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DefaultRequestOptions,
      multi: true,
    },
    CustomCurrencyPlain,
    CustomCurrencyPipe
  ],
  entryComponents: [
    AlertComponent,
    LoaderComponent,
    QualityRatingComponent,
    BottomSheetComponent
  ]
})
export class AppModule {
  constructor(
    public appRef: ApplicationRef,
    public appState: AppServiceComponent
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    /**
     * Set state
     */
    this.appState._state = store.state;
    /**
     * Set input values
     */
    if ("restoreInputValues" in store) {
      const restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(
      (cmp) => cmp.location.nativeElement
    );
    /**
     * Save state
     */
    const state = this.appState._state;
    store.state = state;
    /**
     * Recreate root elements
     */
    store.disposeOldHosts = createNewHosts(cmpLocation);
    /**
     * Save input values
     */
    store.restoreInputValues = createInputTransfer();
    /**
     * Remove styles
     */
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    /**
     * Display new elements
     */
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
