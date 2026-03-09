import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  template: `
    <div
      class="payment-outcome-container h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50"
    >
      <div
        class="cancel-card bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full transform transition-all duration-500 hover:scale-[1.02]"
      >
        <div class="cancel-visual mb-8 text-red-500">
          <div
            class="icon-container flex items-center justify-center bg-red-100 rounded-full w-28 h-28 shadow-lg shadow-red-50 mx-auto animate-pulse-slow"
          >
            <i class="pi pi-times text-red-500 text-6xl font-bold"></i>
          </div>
        </div>

        <h1 class="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Payment Cancelled
        </h1>
        <p class="text-slate-500 text-lg mb-10 leading-relaxed">
          The payment process was cancelled or interrupted. No funds were captured. You are being
          redirected back to your checkout to try again.
        </p>

        <div class="redirect-section border-t border-slate-100 pt-8">
          <div class="flex items-center justify-center gap-3 text-slate-700 font-bold mb-4">
            <i class="pi pi-spin pi-spinner text-xl"></i>
            <span>Returning to Checkout</span>
          </div>

          <div class="progress-bar-container bg-slate-100 h-2 w-full rounded-full overflow-hidden">
            <div class="progress-bar bg-slate-400 h-full animate-progress-fill"></div>
          </div>
          <p class="text-slate-400 text-sm mt-3 font-medium">Redirecting in 5 seconds...</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes pulse-slow {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }

      @keyframes progress-fill {
        from {
          width: 0%;
        }
        to {
          width: 100%;
        }
      }

      .animate-pulse-slow {
        animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .animate-progress-fill {
        animation: progress-fill 5s linear forwards;
      }
    `,
  ],
})
export class PaymentCancelComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/orders/checkout']);
    }, 5000);
  }
}
