import { Component, signal } from '@angular/core';
import { CategoriesComponent } from './features/admin/pages/categories/categories.component';

@Component({
  selector: 'app-root',
  imports: [CategoriesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerce-client');
}
