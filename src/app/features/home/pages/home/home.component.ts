import { Component } from '@angular/core';
import { HeroComponent } from './pages/hero/hero.component';
import { WhyUsComponent } from './pages/why-us/why-us.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { FeaturedProductsComponent } from './pages/featured-products/featured-products.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    CategoriesComponent,
    FeaturedProductsComponent,
    WhyUsComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
