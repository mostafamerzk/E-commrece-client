import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../../core/services/admin.service';
import {
  AdminUser,
  AdminUsersResponse,
  ShippingAddress,
} from '../../../../core/models/admin.model';
import { Pagination } from '../../../../core/models/shared.model';
import { TOAST_FACADE } from '../../../../core/tokens/app.tokens';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toast = inject(TOAST_FACADE);

  users = signal<AdminUser[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);

  // Filters
  searchQuery = signal('');
  roleFilter = signal('user');
  blockedFilter = signal('');
  currentPage = signal(1);

  // Modal state
  isModalOpen = signal(false);
  selectedUser = signal<AdminUser | null>(null);
  editableUser = signal<AdminUser | null>(null);
  isSaving = signal(false);

  private searchSubject = new Subject<string>();

  roles = ['user', 'seller', 'admin'];

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadUsers();
      });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '10' };
    if (this.searchQuery()) params['search'] = this.searchQuery();
    if (this.roleFilter()) params['role'] = this.roleFilter();
    if (this.blockedFilter()) params['isBlocked'] = this.blockedFilter();

    this.adminService.getUsers(params).subscribe({
      next: (res: AdminUsersResponse) => {
        const rawUsers = res.users || [];
        this.users.set(rawUsers.filter((u) => !!u && !!u._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onRoleChange(role: string): void {
    this.roleFilter.set(role);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onBlockedChange(val: string): void {
    this.blockedFilter.set(val);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Modal Actions
  openUserModal(user: AdminUser): void {
    this.selectedUser.set({ ...user });
    this.editableUser.set(JSON.parse(JSON.stringify(user)));
    this.isModalOpen.set(true);
  }

  closeUserModal(): void {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
    this.editableUser.set(null);
  }

  updateEditableField(field: keyof AdminUser, value: string | string[] | boolean | object): void {
    const user = this.editableUser();
    if (!user) return;
    this.editableUser.set({ ...user, [field]: value });
  }

  updateAddress(index: number, field: string, value: string): void {
    const user = this.editableUser();
    if (!user || !user.addresses) return;
    const addresses = [...user.addresses];
    addresses[index] = {
      ...addresses[index],
      [field]: value,
    } as import('../../../../core/models/order.model').ShippingAddress;
    this.editableUser.set({ ...user, addresses });
  }

  addAddress(): void {
    const user = this.editableUser();
    if (!user) return;
    const addresses = user.addresses ? [...user.addresses] : [];
    addresses.push({ street: '', city: '', country: 'Egypt', phone: '', postalCode: '' });
    this.editableUser.set({ ...user, addresses });
  }

  removeAddress(index: number): void {
    const user = this.editableUser();
    if (!user || !user.addresses) return;
    const addresses = user.addresses.filter((_, i) => i !== index);
    this.editableUser.set({ ...user, addresses });
  }

  toggleRole(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const user = this.editableUser();
    if (!user) return;
    this.editableUser.set({ ...user, role: checked ? 'seller' : 'user' });
  }

  saveUserChanges(): void {
    const original = this.selectedUser();
    const updated = this.editableUser();
    if (!original || !updated) return;

    this.isSaving.set(true);

    // Filter payload to include only allowed fields
    const payload: Partial<AdminUser> & Record<string, unknown> = {
      userName: updated.userName,
      phone: updated.phone,
      role: updated.role,
      storename: updated.role === 'seller' ? updated.storename : undefined,
      storeDescription: updated.role === 'seller' ? updated.storeDescription : undefined,
    };

    if (updated.addresses) {
      payload['addresses'] = updated.addresses.map((addr: ShippingAddress) => {
        return {
          street: addr.street,
          city: addr.city,
          country: addr.country,
          postalCode: addr.postalCode,
          phone: addr.phone,
        };
      });
    }

    this.adminService.updateUser(original._id, payload).subscribe({
      next: (updatedUser: AdminUser) => {
        // Merge with existing data so addresses don't disappear if backend response is partial
        const mergedUser: AdminUser =
          updatedUser && updatedUser._id ? { ...updated, ...updatedUser } : { ...updated };

        this.users.update((list: AdminUser[]) =>
          list.map((u) => (u && u._id === original._id ? mergedUser : u))
        );

        this.isSaving.set(false);
        this.toast.success('User updated successfully');
        this.closeUserModal();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error(err?.error?.message || 'Failed to update user');
      },
    });
  }

  restrictUser(user: AdminUser): void {
    this.actionLoading.set(user._id + '-restrict');
    this.adminService.restrictUser(user._id).subscribe({
      next: (updatedUser: AdminUser) => {
        if (!updatedUser || !updatedUser._id) {
          this.actionLoading.set(null);
          this.toast.success('Action completed successfully');
          this.loadUsers();
          return;
        }
        this.users.update((list: AdminUser[]) =>
          list.map((u) => (u && u._id === updatedUser._id ? updatedUser : u))
        );
        this.actionLoading.set(null);
        this.toast.success('Action completed successfully');
      },
      error: (err) => {
        this.actionLoading.set(null);
        this.toast.error(err?.error?.message || 'Action failed');
      },
    });
  }

  approveUser(user: AdminUser): void {
    this.actionLoading.set(user._id + '-approve');
    this.adminService.approveUser(user._id).subscribe({
      next: (updatedUser: AdminUser) => {
        if (!updatedUser || !updatedUser._id) {
          this.actionLoading.set(null);
          this.toast.success('Action completed successfully');
          this.loadUsers();
          return;
        }
        this.users.update((list: AdminUser[]) =>
          list.map((u) => (u && u._id === updatedUser._id ? updatedUser : u))
        );
        this.actionLoading.set(null);
        this.toast.success('Action completed successfully');
      },
      error: (err) => {
        this.actionLoading.set(null);
        this.toast.error(err?.error?.message || 'Action failed');
      },
    });
  }

  changeRole(user: AdminUser, role: string): void {
    if (!role || role === user.role) return;
    this.actionLoading.set(user._id + '-role');
    this.adminService.updateUserRole(user._id, role).subscribe({
      next: (updatedUser: AdminUser) => {
        if (!updatedUser || !updatedUser._id) {
          this.actionLoading.set(null);
          this.toast.success('Action completed successfully');
          this.loadUsers();
          return;
        }
        this.users.update((list: AdminUser[]) =>
          list.map((u) => (u && u._id === updatedUser._id ? updatedUser : u))
        );
        this.actionLoading.set(null);
        this.toast.success('Action completed successfully');
      },
      error: (err) => {
        this.actionLoading.set(null);
        this.toast.error(err?.error?.message || 'Action failed');
      },
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  isActionLoading(userId: string, action: string): boolean {
    return this.actionLoading() === `${userId}-${action}`;
  }
}
