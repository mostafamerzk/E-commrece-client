import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterModule, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  readonly wishlist = inject(WishlistService);

  readonly isLoading = signal(false);
  readonly skeletons = Array(4);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.wishlist.getWishlist().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  confirmClear(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.wishlist.clearWishlist();
    }
  }
}
