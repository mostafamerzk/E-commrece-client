import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Slide {
  id: number;
  image: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    { id: 1, image: 'assets/pexels-freestocks-291762.jpg' },
    { id: 2, image: 'assets/pexels-negativespace-34577.jpg' },
    { id: 3, image: 'assets/pexels-tuurt-2954405.jpg' },
  ];

  activeSlide = 1;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goToSlide(id: number): void {
    this.activeSlide = id;
    this.restartAutoPlay();
  }

  nextSlide(): void {
    this.activeSlide = this.activeSlide === this.slides.length ? 1 : this.activeSlide + 1;
    this.restartAutoPlay();
  }

  prevSlide(): void {
    this.activeSlide = this.activeSlide === 1 ? this.slides.length : this.activeSlide - 1;
    this.restartAutoPlay();
  }

  private startAutoPlay(): void {
    this.timer = setInterval(() => this.nextSlide(), 5000);
  }

  private stopAutoPlay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
