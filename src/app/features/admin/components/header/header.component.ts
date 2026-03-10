import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class AdminHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarExpanded = input<boolean>(true);
  toggleSidebar = output<void>();

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.userName) return 'AD';
    return user.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  onMenuToggle() {
    this.toggleSidebar.emit();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('Admin search:', value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
