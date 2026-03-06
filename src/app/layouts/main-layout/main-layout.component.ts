import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);

  // Auth & cart signals
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  itemCount = this.cartService.itemCount;
  wishlistCount = this.wishlistService.itemCount;

  // UI state signals
  mobileMenuOpen = signal(false);
  isScrolled = signal(false);
  showAnnouncement = signal(true);

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 10);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  hideAnnouncement(): void {
    this.showAnnouncement.set(false);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
