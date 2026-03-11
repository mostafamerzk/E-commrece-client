import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AdminService } from '../../../../core/services/admin.service';
import { User } from '../../../../core/models/auth.model';
import { AdminUsersResponse } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  // ── Data ──────────────────────────────────────────────────
  users = signal<User[]>([]);
  totalUsers = signal(0);
  isLoading = signal(false);

  // ── Filter State ──────────────────────────────────────────
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 10; // plain constant — matches product-list pattern

  // ── Computed ──────────────────────────────────────────────
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter(
      (u) =>
        u.userName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );
  });

  constructor() {
    // URL-driven loading — identical pattern to product-list
    this.route.queryParams.subscribe((params) => {
      if (params['search'] !== undefined) this.searchQuery.set(params['search'] || '');
      if (params['page']) this.currentPage.set(Number(params['page']));
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    console.log('');
  }

  ngAfterViewInit(): void {
    this.initRipples();
  }

  // ── Ripple ────────────────────────────────────────────────
  initRipples(): void {
    if (!this.tableContainer) return;
    const table = this.tableContainer.nativeElement;
    table.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const row = target.closest('tr');
      const btn = target.closest('p-button') || target.closest('.p-button');
      if (row && !btn) this.createRipple(e, row as HTMLElement);
      if (btn) this.createRipple(e, btn as HTMLElement);
    });
  }

  createRipple(event: MouseEvent, container: HTMLElement): void {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${event.clientX - rect.left - size / 2}px;
      top:${event.clientY - rect.top - size / 2}px;
    `;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // ── Data Loading ──────────────────────────────────────────
  loadUsers(): void {
    if (this.searchQuery()) {
      this.loadAllUsersForSearch();
    } else {
      this.loadUsersPaginated();
    }
  }

  loadUsersPaginated(): void {
    this.isLoading.set(true);
    this.adminService
      .getAllUsers({
        page: this.currentPage().toString(),
        limit: this.pageSize.toString(),
      })
      .subscribe({
        next: (res: AdminUsersResponse) => {
          this.users.set(res.data?.docs || []);
          this.totalUsers.set(res.data?.totalDocs || 0);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.handleLoadError(err);
        },
      });
  }

  loadAllUsersForSearch(): void {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (res: AdminUsersResponse) => {
        this.users.set(res.data?.docs || []);
        this.totalUsers.set(res.data?.totalDocs || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleLoadError(err);
      },
    });
  }

  private handleLoadError(err: { status: number } | undefined): void {
    if (err?.status === 401) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unauthorized',
        detail: 'Please login to access this page',
      });
    } else if (err?.status === 403) {
      this.messageService.add({
        severity: 'error',
        summary: 'Forbidden',
        detail: 'You do not have permission to access this page',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load users',
      });
    }
  }

  // ── Filter / Page ─────────────────────────────────────────
  onFilterChange(): void {
    this.currentPage.set(1);
    this.updateUrl();
    // updateUrl → queryParams subscription → loadUsers()
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set((event.page ?? 0) + 1);
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.updateUrl();
  }

  // ── Actions ───────────────────────────────────────────────
  approveUser(user: User): void {
    console.log('[Approve] User ID:', user._id);
    this.confirmationService.confirm({
      message: `Are you sure you want to approve "${user.userName}"?`,
      header: 'Confirm Approval',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        console.log('[Approve] Calling API for user:', user._id);
        this.adminService.approveUser(user._id).subscribe({
          next: (res) => {
            console.log('[Approve] Success:', res);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User approved',
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('[Approve] Error:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Could not approve user',
            });
          },
        });
      },
    });
  }

  restrictUser(user: User): void {
    console.log('[Restrict] User ID:', user._id);
    this.confirmationService.confirm({
      message: `Are you sure you want to restrict "${user.userName}"? This will prevent them from accessing the platform.`,
      header: 'Confirm Restriction',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        console.log('[Restrict] Calling API for user:', user._id);
        this.adminService.restrictUser(user._id).subscribe({
          next: (res) => {
            console.log('[Restrict] Success:', res);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User restricted',
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('[Restrict] Error:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Could not restrict user',
            });
          },
        });
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'role-badge-admin';
      case 'seller':
        return 'role-badge-seller';
      default:
        return 'role-badge-customer';
    }
  }

  getStatusBadgeClass(user: User): string {
    if (user.isDeleted) return 'status-badge-deleted';
    if (user.isAcctivated === false) return 'status-badge-restricted';
    if (user.isAcctivated === true) return 'status-badge-active';
    return 'status-badge-pending';
  }

  getStatusLabel(user: User): string {
    if (user.isDeleted) return 'Deleted';
    if (user.isAcctivated === false) return 'Restricted';
    if (user.isAcctivated === true) return 'Active';
    return 'Pending';
  }
}
