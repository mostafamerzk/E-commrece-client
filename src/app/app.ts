import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartComponent } from './features/cart/pages/cart/cart.component';
import { CheckoutComponent } from './features/orders/pages/checkout/checkout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CartComponent, CheckoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerce-client');
}
