import { Component, input } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  imports: [],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.css',
})
export class PrimaryButton {
  isDisabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  loadingText = input<string>('Please wait...');
}
