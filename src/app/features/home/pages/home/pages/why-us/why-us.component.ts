import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-us.component.html',
  styleUrl: './why-us.component.scss',
})
export class WhyUsComponent {
  features = [
    {
      icon: 'pi pi-truck',
      title: 'Fast Shipping',
      description: 'Get your premium essentials delivered to your doorstep in 2-3 business days.',
    },
    {
      icon: 'pi pi-shield',
      title: 'Secure Payment',
      description:
        'Shop with confidence using our encrypted and industry-leading payment gateways.',
    },
    {
      icon: 'pi pi-refresh',
      title: 'Easy Returns',
      description:
        'Not satisfied? No problem. We offer a hassle-free 30-day return policy for all items.',
    },
    {
      icon: 'pi pi-headphones',
      title: '24/7 Support',
      description:
        'Our dedicated support team is available around the clock to assist you with any query.',
    },
  ];
}
