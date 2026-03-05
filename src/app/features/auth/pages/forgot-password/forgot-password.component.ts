import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthLayout } from '../../../../shared/components/auth-layout/auth-layout';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthLayout,
    PrimaryButton,
    FormFieldComponent,
    TextInputComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  async onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.authService.forgotPassword(this.email);
      this.successMessage.set('Password reset instructions sent to your email.');
      this.email = '';
      form.resetForm();
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } | string; message?: string };
      const message =
        (typeof err.error === 'object' ? err.error?.message : err.error) ||
        err.message ||
        'Failed to process request. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
