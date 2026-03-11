import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { OrderListComponent } from '../../../features/orders/pages/order-list/order-list.component';

// ── Custom Validators ─────────────────────────────────────────────────────────

const userNameValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v: string = ctrl.value ?? '';
  if (!v) return null;
  return /^[a-zA-Z0-9_]{5,15}$/.test(v) ? null : { userName: true };
};

const newNotSameAsOldValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const oldPass = group.get('oldPassword')?.value;
  const newPass = group.get('newPassword')?.value;
  if (!oldPass || !newPass) return null;
  return oldPass === newPass ? { sameAsOld: true } : null;
};

const confirmMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPass = group.get('newPassword')?.value;
  const confirmPass = group.get('confirmPassword')?.value;
  if (!confirmPass) return null;
  return newPass !== confirmPass ? { mismatch: true } : null;
};

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Tab {
  key: 'info' | 'password' | 'orders' | 'addresses';
  label: string;
  icon: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TitleCasePipe, OrderListComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  readonly user = this.auth.currentUser;

  readonly tabs: Tab[] = [
    { key: 'info', label: 'Personal Info', icon: 'pi-user' },
    { key: 'password', label: 'Change Password', icon: 'pi-lock' },
    { key: 'orders', label: 'My Orders', icon: 'pi-shopping-bag' },
    { key: 'addresses', label: 'Addresses', icon: 'pi-map-marker' },
  ];

  readonly activeTab = signal<Tab['key']>('info');

  setTab(key: Tab['key']): void {
    this.activeTab.set(key);
  }

  // ── Personal Info Form ────────────────────────────────────────────────────
  infoForm = this.fb.group({
    userName: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(15), userNameValidator],
    ],
  });

  readonly isUploadingAvatar = signal(false);
  readonly avatarError = signal('');
  readonly avatarPreview = signal<string | null>(null);
  readonly isSavingInfo = signal(false);
  readonly infoSuccess = signal(false);
  readonly infoError = signal('');

  get f() {
    return this.infoForm.controls;
  }

  saveInfo(): void {
    this.infoForm.markAllAsTouched();
    if (this.infoForm.invalid) return;

    this.isSavingInfo.set(true);
    this.infoError.set('');
    this.infoSuccess.set(false);

    this.userService.updateProfile({ userName: this.f['userName'].value! }).subscribe({
      next: () => {
        this.isSavingInfo.set(false);
        this.infoSuccess.set(true);
        setTimeout(() => this.infoSuccess.set(false), 3000);
      },
      error: (err) => {
        this.isSavingInfo.set(false);
        this.infoError.set(err?.error?.message ?? 'Failed to update profile. Please try again.');
      },
    });
  }

  // ── Change Password Form ──────────────────────────────────────────────────
  passwordForm = this.fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [newNotSameAsOldValidator, confirmMatchValidator] }
  );

  readonly showOldPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly isSavingPassword = signal(false);
  readonly passwordSuccess = signal(false);
  readonly passwordError = signal('');

  toggleOldPassword(): void {
    this.showOldPassword.update((v) => !v);
  }
  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  get p() {
    return this.passwordForm.controls;
  }

  savePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    this.isSavingPassword.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    this.userService
      .changePassword({
        oldPassword: this.p['oldPassword'].value!,
        newPassword: this.p['newPassword'].value!,
        confirmPassword: this.p['confirmPassword'].value!,
      })
      .subscribe({
        next: () => {
          this.isSavingPassword.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccess.set(false), 3000);
        },
        error: (err) => {
          this.isSavingPassword.set(false);
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            err?.message ||
            'Failed to update password. Please try again.';
          this.passwordError.set(msg);
          this.p['oldPassword'].setErrors({ serverError: true });
        },
      });
  }

  // ── Address Form ──────────────────────────────────────────────────────────
  addressForm = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    country: ['Egypt', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
  });

  readonly isSavingAddress = signal(false);
  readonly addressSuccess = signal(false);
  readonly addressError = signal('');

  get a() {
    return this.addressForm.controls;
  }

  saveAddress(): void {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid) return;
    this.isSavingAddress.set(true);
    this.addressError.set('');
    setTimeout(() => {
      this.isSavingAddress.set(false);
      this.addressSuccess.set(true);
      setTimeout(() => this.addressSuccess.set(false), 3000);
    }, 800);
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.infoForm.patchValue({ userName: u.userName ?? '' });
    }
  }

  // ── Password Strength ─────────────────────────────────────────────────────
  passwordStrength(value: string): 'weak' | 'fair' | 'strong' {
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    return 'strong';
  }

  // ── Avatar Upload ─────────────────────────────────────────────────────────
  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.avatarError.set('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.avatarError.set('Image must be smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    this.avatarError.set('');
    this.isUploadingAvatar.set(true);

    this.userService.uploadProfileImage(file).subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.avatarPreview.set(null);
      },
      error: () => {
        this.isUploadingAvatar.set(false);
        this.avatarPreview.set(null);
        this.avatarError.set('Failed to upload image. Please try again.');
      },
    });

    input.value = '';
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
