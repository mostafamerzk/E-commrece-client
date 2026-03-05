import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from './features/home/pages/home/pages/hero/hero.component';
import { WhyUsComponent } from './features/home/pages/home/pages/why-us/why-us.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeroComponent, WhyUsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerce-client');
}
