import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../../../core/services/admin.service';
import { SellerDetail } from '../../../../../core/models/admin.model';

@Component({
  selector: 'app-seller-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-detail.component.html',
  styleUrl: './seller-detail.component.css',
})
export class SellerDetailComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  seller = signal<SellerDetail | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSeller(id);
  }

  loadSeller(id: string): void {
    this.isLoading.set(true);
    this.adminService.getSellerById(id).subscribe({
      next: (seller: SellerDetail) => {
        // Log to identify property names in detail response if possible (internal hint)
        this.seller.set(seller);
        this.isLoading.set(false);

        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load seller details.');
        this.isLoading.set(false);
      },
    });
  }

  approveSeller(): void {
    const s = this.seller();
    if (!s) return;
    this.actionLoading.set(true);
    this.adminService.approveSeller(s._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSeller(s._id);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  restrictSeller(): void {
    const s = this.seller();
    if (!s) return;
    this.actionLoading.set(true);
    this.adminService.restrictSeller(s._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSeller(s._id);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }
}
