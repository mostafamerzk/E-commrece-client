import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../../../../../core/services/home.service';
import { Category } from '../../../../../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private homeService = inject(HomeService);

  // ── All data from API (stored once) ──────────────────────
  private allCategories: Category[] = [];

  // ── What's currently visible on screen ───────────────────
  visibleCategories: Category[] = [];

  loading = true;
  loadingMore = false;
  error = false;

  private readonly pageSize = 6; // عدد الـ categories في كل مرة
  private currentCount = 0; // كام item بيتعرض دلوقتي

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.homeService.getCategories().subscribe({
      next: (res) => {
        this.allCategories = res.categories; // خزن كل حاجة
        this.showMore(true); // عرض أول 6
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  // ── Load More ─────────────────────────────────────────────
  loadMore(): void {
    if (!this.hasMore || this.loadingMore) return;
    this.loadingMore = true;

    // Simulate a small delay so it feels smooth
    setTimeout(() => {
      this.showMore();
      this.loadingMore = false;
    }, 300);
  }

  private showMore(initial = false): void {
    if (initial) this.currentCount = 0;
    this.currentCount += this.pageSize;
    this.visibleCategories = this.allCategories.slice(0, this.currentCount);
  }

  // ── Helpers ───────────────────────────────────────────────
  get hasMore(): boolean {
    return this.currentCount < this.allCategories.length;
  }

  get totalCount(): number {
    return this.allCategories.length;
  }
}
