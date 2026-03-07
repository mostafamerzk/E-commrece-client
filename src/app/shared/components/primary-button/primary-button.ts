import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.css',
})
export class PrimaryButton {
  isDisabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  loadingText = input<string>('Please wait...');
  type = input<'button' | 'submit' | 'reset'>('button');
  size = input<'base' | 'sm'>('base');
  extraClass = input<string>('');
}
