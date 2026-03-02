import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- 1. Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Category Management</h1>
          <p class="text-sm text-gray-500">{{ categories().length }} total categories</p>
        </div>
        <p-button
          label="Add Category"
          icon="pi pi-plus"
          (onClick)="showDialog()"
          styleClass="p-button-sm"
        ></p-button>
      </div>

      <!-- 2. Filter Toolbar -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex items-center shadow-sm">
        <div class="relative w-full md:w-80">
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          ></i>
          <input
            pInputText
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search categories..."
            class="w-full text-sm pl-10"
          />
        </div>
      </div>

      <!-- 3. Data Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <p-table
          [value]="filteredCategories()"
          [rows]="10"
          [paginator]="true"
          [responsiveLayout]="'scroll'"
          [loading]="isLoading()"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="w-24">Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Created At</th>
              <th class="w-32">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-category>
            <tr class="hover:bg-gray-50 transition-colors">
              <td>
                <div class="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                  <img
                    [src]="category.image.secure_url"
                    [alt]="category.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td class="font-medium text-gray-800">{{ category.name }}</td>
              <td class="text-gray-500 text-sm">{{ category.slug }}</td>
              <td class="text-gray-400 text-xs">{{ category.createdAt | date: 'mediumDate' }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [text]="true"
                    severity="success"
                    (onClick)="editCategory(category)"
                    aria-label="Edit"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteCategory(category)"
                    aria-label="Delete"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-12">
                <div class="flex flex-col items-center gap-3 text-gray-400">
                  <i class="pi pi-tags text-5xl"></i>
                  <p class="text-lg font-semibold text-gray-600">No categories found</p>
                  <p class="text-sm">
                    {{
                      searchQuery()
                        ? 'Try adjusting your search query.'
                        : 'Get started by creating your first category.'
                    }}
                  </p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- 4. Dialog -->
      <p-dialog
        [(visible)]="displayDialog"
        [header]="isEditing ? 'Edit Category' : 'Add Category'"
        [modal]="true"
        [style]="{ width: '520px' }"
        [draggable]="false"
        appendTo="body"
      >
        <div class="flex flex-col gap-5 pt-2">
          <div class="flex flex-col gap-2">
            <label for="name" class="text-sm font-medium text-gray-700">Category Name *</label>
            <input
              pInputText
              id="name"
              [(ngModel)]="categoryForm.name"
              placeholder="e.g. Home Appliances"
              class="w-full"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-sm font-medium text-gray-700">Category Image *</span>
            <p-fileUpload
              mode="basic"
              [auto]="false"
              chooseLabel="Choose Image"
              chooseIcon="pi pi-upload"
              (onSelect)="onFileSelect($event)"
              accept="image/*"
              styleClass="w-full"
            ></p-fileUpload>
            <div
              *ngIf="selectedFile"
              class="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1"
            >
              <i class="pi pi-file text-[10px]"></i> {{ selectedFile.name }}
            </div>
            <p class="text-xs text-gray-400 mt-1">Recommended: Square image, max 2MB.</p>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2 justify-end">
            <p-button
              label="Cancel"
              [text]="true"
              severity="secondary"
              (onClick)="hideDialog()"
            ></p-button>
            <p-button
              label="Save Changes"
              icon="pi pi-check"
              [disabled]="!categoryForm.name || (!isEditing && !selectedFile)"
              (onClick)="saveCategory()"
            ></p-button>
          </div>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      ::ng-deep .p-datatable-sm .p-datatable-tbody > tr > td {
        padding: 0.5rem 1rem;
      }
    `,
  ],
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categories = signal<Category[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();
    return this.categories().filter(
      (c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
    );
  });

  displayDialog = false;
  isEditing = false;
  categoryForm: { name: string; id?: string } = { name: '' };
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
    this.categoryForm = { name: '' };
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
    this.categoryForm = { name: category.name, id: category._id };
    this.selectedFile = null;
    this.displayDialog = true;
  }

  saveCategory() {
    this.isLoading.set(true);
    if (this.isEditing && this.categoryForm.id) {
      this.categoryService
        .update(
          this.categoryForm.id,
          { name: this.categoryForm.name },
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
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not update category',
            });
            this.isLoading.set(false);
          },
        });
    } else if (this.selectedFile) {
      this.categoryService.create({ name: this.categoryForm.name }, this.selectedFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category created',
          });
          this.loadCategories();
          this.hideDialog();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create category',
          });
          this.isLoading.set(false);
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
