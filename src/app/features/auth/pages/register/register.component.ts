import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthLayout } from '../../../../shared/components/auth-layout/auth-layout';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthLayout,
    PrimaryButton,
    FormFieldComponent,
    TextInputComponent,
    PasswordInputComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.css'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  acceptTerms = false;

  isLoading = signal(false);
  errorMessage = signal('');

  async onSubmit(form: NgForm) {
    if (form.invalid || !this.acceptTerms) return;
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.register({
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
        userName: this.fullName,
      });
      // Navigate to login after successful registration
      this.router.navigate(['/auth/login']);
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } | string; message?: string };
      const message =
        (typeof err.error === 'object' ? err.error?.message : err.error) ||
        err.message ||
        'Registration failed. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
