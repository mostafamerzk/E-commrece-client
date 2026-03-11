import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../../core/services/admin.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Product } from '../../../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isDeleting = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error.set('Product ID not found');
      this.isLoading.set(false);
    }
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.adminService.getAdminProductById(id).subscribe({
      next: (product: Product) => {
        if (!product) {
          this.error.set('Product data is empty');
          this.isLoading.set(false);
          return;
        }
        this.product.set({ ...product });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product details');
        this.isLoading.set(false);
      },
    });
  }

  onSave(): void {
    const p = this.product();
    if (!p) return;

    this.isSaving.set(true);
    const updateData: Partial<Product> = {
      title: p.title,
      price: p.price,
      discount: p.discount,
      stock: p.stock,
      description: p.description,
    };

    this.adminService.updateProduct(p._id, updateData).subscribe({
      next: (updated: Product) => {
        this.product.set(updated);
        this.isSaving.set(false);
        this.toast.success('Product updated successfully');
      },
      error: () => {
        this.isSaving.set(false);
        alert('Failed to update product');
      },
    });
  }

  onDelete(): void {
    const p = this.product();
    if (!p) return;

    if (confirm('Are you sure you want to delete this product?')) {
      this.isDeleting.set(true);
      this.adminService.deleteProduct(p._id).subscribe({
        next: () => {
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.isDeleting.set(false);
          alert('Failed to delete product');
        },
      });
    }
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }
}
