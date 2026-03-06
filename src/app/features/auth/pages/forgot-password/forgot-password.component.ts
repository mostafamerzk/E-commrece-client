import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  styleUrls: ['../auth.css'],
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
      const res = await this.authService.forgotPassword(this.email);
      this.successMessage.set(res.message);
      const email = this.email.toString();
      // Redirect to reset password page with email parameter
      setTimeout(() => {
        this.router.navigate([`/auth/reset-password?email=${email}`]);
      }, 2000);

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
