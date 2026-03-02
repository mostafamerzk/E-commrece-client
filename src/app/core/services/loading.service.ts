import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal(false);
  private requests = 0;

  loading = this._loading.asReadonly();

  show() {
    this.requests++;
    this._loading.set(true);
  }

  hide() {
    this.requests--;
    if (this.requests <= 0) {
      this._loading.set(false);
      this.requests = 0;
    }
  }
}
