import { Component, input } from '@angular/core';
import { ReviewsSectionComponent } from '../../../../shared/components/reviews-section/reviews-section.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ReviewsSectionComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-8">Product Detail Page</h1>
      <app-reviews-section [productId]="id()" />
    </div>
  `,
})
export class ProductDetailComponent {
  id = input.required<string>();
}
