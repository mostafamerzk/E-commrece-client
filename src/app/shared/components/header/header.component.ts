import {
  Component,
  signal,
  HostListener,
  inject,
  OnDestroy,
  input,
  output,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy, OnInit {
  // ── Services ─────────────────────────────────────────────
  newcurrent = JSON.parse(localStorage.getItem('user') || 'null');

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.wishlistService.getWishlist().subscribe();
    }
  }
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  // ── UI State ─────────────────────────────────────────────
  readonly mobileMenuOpen = signal(false);
  readonly isScrolled = signal(false);
  readonly showAnnouncement = signal(true);

  // ── Search State ──────────────────────────────────────────
  searchQuery = '';
  searchResults = signal<Product[]>([]);
  searchLoading = signal(false);
  searchOpen = signal(false);

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  readonly wishlistCount = this.wishlistService.itemCount;

  // ── Derived State ─────────────────────────────────────────
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;
  readonly itemCount = this.cartService.itemCount;

  // ── Sidebar State (Admin Layout) ─────────────────────────
  sidebarExpanded = input<boolean | undefined>(undefined);
  toggleSidebar = output<void>();

  onSidebarToggle() {
    this.toggleSidebar.emit();
  }

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim() || query.length < 2) {
            this.searchResults.set([]);
            this.searchOpen.set(false);
            this.searchLoading.set(false);
            return of(null);
          }
          this.searchLoading.set(true);
          return this.productService.getAll({ search: query, limit: '6' });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.searchResults.set(res.products);
            this.searchOpen.set(res.products.length > 0);
          }
          this.searchLoading.set(false);
        },
        error: () => {
          this.searchLoading.set(false);
          this.searchOpen.set(false);
        },
      });
  }

  // ── Search Handlers ───────────────────────────────────────
  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.trim()) {
      this.goToSearch();
    }
    if (event.key === 'Escape') {
      this.closeSearch();
    }
  }

  goToSearch(): void {
    if (!this.searchQuery.trim()) return;
    const query = this.searchQuery.trim();
    this.closeSearch();
    this.router.navigate(['/products'], {
      queryParams: { search: query },
    });
  }

  selectProduct(productId: string): void {
    this.closeSearch();
    this.router.navigate(['/products', productId]);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
    this.searchResults.set([]);
    this.searchQuery = '';
  }

  // ── UI Handlers ───────────────────────────────────────────
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  hideAnnouncement(): void {
    this.showAnnouncement.set(false);
  }
  goToProfile() {
    this.router.navigate(['/profile']);
  }
  // ── Auth ──────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // ── Scroll ────────────────────────────────────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-search')) {
      this.searchOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
