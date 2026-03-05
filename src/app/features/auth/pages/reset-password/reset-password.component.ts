import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthLayout } from '../../../../shared/components/auth-layout/auth-layout';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['../auth.css'],
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  otp = '';
  password = '';
  confirmPassword = '';

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    console.log(this.email);
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) return;

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const payload = {
        otp: this.otp,
        password: this.password,
        confirmPassword: this.confirmPassword,
      };
      console.log('Reset Password Request:', { email: this.email, payload });
      const res = await this.authService.resetPassword(this.email, payload);
      this.successMessage.set(res.message);
      console.log(payload);
      console.log(res);
      // Redirect to login after successful reset after a short delay
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } catch (error: unknown) {
      const err = error as { error?: { message?: string } | string; message?: string };
      const message =
        (typeof err.error === 'object' ? err.error?.message : err.error) ||
        err.message ||
        'Failed to reset password. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
