import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';
import { Category } from '../../../../core/models/category.model';
import { Pagination } from '../../../../core/models/shared.model';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  animations: [listAnimation, fadeInOut],
})
export class CategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);
  searchQuery = signal('');
  currentPage = signal(1);

  private searchSubject = new Subject<string>();

  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  categoryForm!: FormGroup;

  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter((c) => c.name.toLowerCase().includes(q));
  });

  parentCategories = computed(() => this.categories().filter((c) => !c.parentCategoryId));

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadCategories();
      });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(category?: Category): void {
    this.categoryForm = this.fb.group({
      name: [category?.name ?? '', Validators.required],
      description: [category?.description ?? ''],
      parentCategoryId: [category?.parentCategoryId ?? ''],
    });
    this.imagePreview.set(category?.image?.secure_url ?? null);
    this.selectedFile = null;
  }

  loadCategories(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '10' };
    if (this.searchQuery()) params['search'] = this.searchQuery();

    this.adminService.getCategories(params).subscribe({
      next: (res) => {
        const rawCategories = res.categories || [];
        this.categories.set(rawCategories.filter((c) => !!c && !!c._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.initForm();
    this.showModal.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.initForm(category);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) =>
        this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const editing = this.editingCategory();
    const formData = new FormData();
    formData.append('name', this.categoryForm.value.name);
    if (this.categoryForm.value.description) {
      formData.append('description', this.categoryForm.value.description);
    }
    if (this.categoryForm.value.parentCategoryId) {
      formData.append('parentCategoryId', this.categoryForm.value.parentCategoryId);
    }
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    const req = editing
      ? this.adminService.updateCategory(editing._id, formData)
      : this.adminService.createCategory(formData);

    req.subscribe({
      next: (res) => {
        const updatedCategory = res.category;
        if (!updatedCategory || !updatedCategory._id) {
          this.isSaving.set(false);
          this.loadCategories();
          return;
        }
        if (editing) {
          this.categories.update((list) =>
            list.map((c) => (c && c._id === updatedCategory._id ? updatedCategory : c))
          );
        } else {
          this.categories.update((list) => [updatedCategory, ...list]);
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  requestDelete(category: Category): void {
    this.confirmDeleteId.set(category._id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.actionLoading.set(id);
    this.confirmDeleteId.set(null);
    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c._id !== id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '';
    return this.categories().find((c) => c._id === parentId)?.name ?? '';
  }

  isFieldInvalid(field: string): boolean {
    const c = this.categoryForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCategories();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }
}
