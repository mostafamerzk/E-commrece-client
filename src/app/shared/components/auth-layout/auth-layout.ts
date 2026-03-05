import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  imports: [],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  title = input.required<string>();
  subtitle = input.required<string>();
  errorMessage = input<string>('');
}
