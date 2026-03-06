import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * A configurable reusable component displayed when a list, page, or section has no content.
 * Encourages the user to take the next logical action.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './empty-state.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class EmptyStateComponent {
  // Signal inputs (Angular 20)
  icon = input<string>('pi pi-inbox'); // PrimeIcon class
  title = input.required<string>();
  description = input<string>('');
  actionLabel = input<string>(''); // If empty, button hidden
  actionIcon = input<string>('pi pi-arrow-right');

  // Output
  _onAction = output<void>();

  handleAction(): void {
    this._onAction.emit();
  }
}
