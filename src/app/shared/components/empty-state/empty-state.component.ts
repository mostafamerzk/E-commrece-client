import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center text-center min-h-[300px] p-6 md:p-12 gap-4 md:gap-6 animate-[fadeIn_0.4s_ease-out]"
      role="status"
      aria-live="polite"
    >
      <!-- Icon -->
      <div class="text-7xl md:text-8xl text-gray-200" aria-hidden="true">
        <i [class]="icon()"></i>
      </div>

      <!-- Title -->
      <h2 class="text-xl md:text-2xl font-bold text-gray-700">
        {{ title() }}
      </h2>

      <!-- Description -->
      <p *ngIf="description()" class="text-sm md:text-base text-gray-500 max-w-sm">
        {{ description() }}
      </p>

      <!-- Action Button -->
      <p-button
        *ngIf="actionLabel()"
        [label]="actionLabel()"
        [icon]="actionIcon()"
        (onClick)="actionOccurred.emit()"
        styleClass="mt-2 p-button-rounded w-full sm:w-auto"
      ></p-button>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class EmptyStateComponent {
  icon = input<string>('pi pi-inbox');
  title = input.required<string>();
  description = input<string>('');
  actionLabel = input<string>('');
  actionIcon = input<string>('pi pi-arrow-right');

  actionOccurred = output<void>();
}
