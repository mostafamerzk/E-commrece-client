import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoriesComponent } from './features/admin/pages/categories/categories.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoriesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerce-client');
}
