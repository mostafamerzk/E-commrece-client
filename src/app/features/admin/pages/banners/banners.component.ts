import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Banner } from '../../../../core/models/banner.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './banners.component.html',
  styleUrl: './banners.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminBannersComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  banners = signal<Banner[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  isSaving = signal(false);
  actionLoading = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);
  currentPage = signal(1);

  showModal = signal(false);
  editingBanner = signal<Banner | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  bannerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadBanners();
  }

  initForm(banner?: Banner): void {
    this.bannerForm = this.fb.group({
      title: [banner?.title ?? '', Validators.required],
      link: [banner?.link ?? ''],
    });
    this.imagePreview.set(banner?.image?.secure_url ?? null);
    this.selectedFile = null;
  }

  loadBanners(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params = { page: String(this.currentPage()), limit: '10' };

    this.adminService.getBanners(params).subscribe({
      next: (res: import('../../../../core/models/banner.model').BannersResponse) => {
        const rawBanners = res.banners || [];
        this.banners.set(rawBanners.filter((b) => !!b && !!b._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load banners. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingBanner.set(null);
    this.initForm();
    this.showModal.set(true);
  }

  openEditModal(banner: Banner): void {
    this.editingBanner.set(banner);
    this.initForm(banner);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingBanner.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveBanner(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      return;
    }
    const editing = this.editingBanner();
    if (!editing && !this.selectedFile) {
      return; // Image required for new banner
    }

    this.isSaving.set(true);
    const formData = new FormData();
    formData.append('title', this.bannerForm.value.title);
    if (this.bannerForm.value.link) formData.append('link', this.bannerForm.value.link);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    const req = editing
      ? this.adminService.updateBanner(editing._id, formData)
      : this.adminService.createBanner(formData);

    req.subscribe({
      next: (updatedBanner: Banner) => {
        if (!updatedBanner || !updatedBanner._id) {
          this.isSaving.set(false);
          this.loadBanners();
          return;
        }
        if (editing) {
          this.banners.update((list: Banner[]) =>
            list.map((b) => (b && b._id === updatedBanner._id ? updatedBanner : b))
          );
        } else {
          this.banners.update((list: Banner[]) => [updatedBanner, ...list]);
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => this.isSaving.set(false),
    });
  }

  toggleActive(banner: Banner): void {
    this.actionLoading.set(banner._id + '-toggle');
    const fd = new FormData();
    fd.append('isActive', String(!banner.isActive));
    this.adminService.updateBanner(banner._id, fd).subscribe({
      next: (updatedBanner: Banner) => {
        if (!updatedBanner || !updatedBanner._id) {
          this.actionLoading.set(null);
          this.loadBanners();
          return;
        }
        this.banners.update((list: Banner[]) =>
          list.map((b) => (b && b._id === updatedBanner._id ? updatedBanner : b))
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  requestDelete(banner: Banner): void {
    this.confirmDeleteId.set(banner._id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.actionLoading.set(id + '-delete');
    this.confirmDeleteId.set(null);
    this.adminService.deleteBanner(id).subscribe({
      next: () => {
        this.banners.update((list: Banner[]) => list.filter((b) => b._id !== id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.bannerForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadBanners();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
