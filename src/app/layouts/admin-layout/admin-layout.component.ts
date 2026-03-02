import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>Admin Navbar</nav>
    <router-outlet></router-outlet>
  `,
})
export class AdminLayoutComponent {}
