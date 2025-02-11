import { trigger, state, animate, transition, style } from '@angular/animations';

// trigger name for attaching this animation to an element using the [@triggerName] syntax
export const fadeInAnimation = trigger('fadeInAnimation', [
  // route 'enter' transition
  transition(':enter', [
    // css styles at start of transition
    style({ opacity: 0 }),
    // animation and styles at end of transition
    animate('.3s', style({ opacity: 1 }))
  ]),
]);
