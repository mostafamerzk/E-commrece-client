import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        stagger(50, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [animate('200ms ease-in', style({ opacity: 0, height: 0, marginBottom: 0, padding: 0 }))],
      { optional: true }
    ),
  ]),
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
  transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
]);
