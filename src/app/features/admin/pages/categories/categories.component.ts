import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.components.css',
  encapsulation: ViewEncapsulation.None,
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categories = signal<Category[]>([]);
  isLoading = signal(false);
  isSaving = signal(false); // Added missing signal
  searchQuery = signal('');

  parentCategories = computed(() => this.categories().filter((c) => !c.parentCategoryId)); // Added computed for parent categories

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();
    return this.categories().filter(
      (c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
    );
  });

  displayDialog = false;
  isEditing = false;
  categoryForm: {
    name: string;
    slug?: string;
    description?: string;
    parentCategoryId?: string;
    id?: string;
    existingImageUrl?: string;
  } = {
    name: '',
    slug: '',
    description: '',
    parentCategoryId: undefined,
  };
  selectedFile: File | null = null;

  ngOnInit() {
    this.loadCategories();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  loadCategories() {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load categories',
        });
        this.isLoading.set(false);
      },
    });
  }

  showDialog() {
    this.isEditing = false;
    this.categoryForm = { name: '', slug: '', description: '' };
    this.selectedFile = null;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
  }

  onFileSelect(event: { files: File[] }) {
    this.selectedFile = event.files[0];
  }

  editCategory(category: Category) {
    this.isEditing = true;
    this.categoryForm = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentCategoryId: category.parentCategoryId,
      existingImageUrl: category.image?.secure_url,
      id: category._id,
    };
    this.selectedFile = null;
    this.displayDialog = true;
  }

  saveCategory() {
    this.isSaving.set(true); // Using isSaving instead of isLoading for the button state
    if (this.isEditing && this.categoryForm.id) {
      this.categoryService
        .update(
          this.categoryForm.id,
          { name: this.categoryForm.name, description: this.categoryForm.description },
          this.selectedFile || undefined
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated',
            });
            this.loadCategories();
            this.hideDialog();
            this.isSaving.set(false);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not update category',
            });
            this.isSaving.set(false);
          },
        });
    } else if (this.selectedFile) {
      this.categoryService
        .create(
          { name: this.categoryForm.name, description: this.categoryForm.description },
          this.selectedFile
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category created',
            });
            this.loadCategories();
            this.hideDialog();
            this.isSaving.set(false); // Added this line
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not create category',
            });
            this.isSaving.set(false); // Changed from isLoading to isSaving
          },
        });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"? This cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.isLoading.set(true);
        this.categoryService.delete(category._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted',
            });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not delete category',
            });
            this.isLoading.set(false);
          },
        });
      },
    });
  }
}
