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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['../auth.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = false;

  isLoading = signal(false);
  errorMessage = signal('');

  async onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.email, this.password);

      // Navigate based on role
      const user = this.authService.currentUser();
      if (user?.role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (user?.role === 'seller') {
        this.router.navigate(['/seller']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } | string; message?: string };
      const message =
        (typeof err.error === 'object' ? err.error?.message : err.error) ||
        err.message ||
        'Invalid email or password. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
