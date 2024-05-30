import { Routes } from '@angular/router';
import {
  PreloaderComponent,
  WelcomeComponent,
  QuestionnaireComponent,
  SummaryComponent,
  ResultComponent,
  HistoryComponent,
  NoContentComponent,
  NoConnectionComponent,
  LockedComponent,
  DefinitivePaymentComponent,
  QuestionnaireATMComponent,
  SummaryATMComponent,
  ResultATMComponent,
  PantallaCashbackComponent,
  HeaderComponent,
  DynamicQuestionnaireComponent,
  DeferPurchaseComponent
} from './pages';

// TDD imports components
import {
  WelcomeTddComponent,
  QuestionnaireTddComponent,
  LockedTddComponent,
  ResultTddComponent,
  SummaryTddComponent,
  PreloaderTddComponent,
  DefinitivePaymentComponentTDD
} from './pages/tdd/';
import { WarningCancellationComponent } from './pages/warning-cancellation/warning-cancellation.component';
import { LinexComponent } from './pages/linex/linex.component';

export const ROUTES: Routes = [
  { path: '', component: PreloaderComponent },
  { path: 'tdc', component: PreloaderComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'questionnaire', component: QuestionnaireComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'result', component: ResultComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'no-content', component: NoContentComponent },
  { path: 'no-connection', component: NoConnectionComponent },
  { path: 'locked', component: LockedComponent },
  { path: 'definitivePayment', component: DefinitivePaymentComponent },
  { path: 'tdd',component:PreloaderTddComponent},
  { path: 'welcomeTDD', component: WelcomeTddComponent },
  { path: 'questionnaireTDD', component: QuestionnaireTddComponent },
  { path: 'resultTDD', component: ResultTddComponent },
  { path: 'summaryTDD', component: SummaryTddComponent },
  { path: 'lockedTDD', component: LockedTddComponent },
  { path: 'questionarie-atm', component: QuestionnaireATMComponent},
  { path: 'summary-atm', component: SummaryATMComponent},
  { path: 'result-atm', component: ResultATMComponent},
  { path: 'definitivePaymentTDD', component: DefinitivePaymentComponentTDD},
  { path: 'cashback-movements', component: PantallaCashbackComponent},
  { path: 'd-questionnarie', component: DynamicQuestionnaireComponent},
  { path: 'defer-purchase', component: DeferPurchaseComponent},
  { path: 'warning-cancellation', component: WarningCancellationComponent},
  { path: 'linex', component: LinexComponent},
  { path: '**', component: NoContentComponent },
];
