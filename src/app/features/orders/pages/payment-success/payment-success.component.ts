import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  template: `
    <div class="scene">
      <div class="card">
        <div class="check-wrapper">
          <svg class="check-svg" viewBox="0 0 52 52">
            <circle class="check-circle" cx="26" cy="26" r="24" />
            <path class="check-mark" d="M14 26 l8 8 l16-16" />
          </svg>
          <div class="ripple r1"></div>
          <div class="ripple r2"></div>
        </div>

        <h1 class="headline">Order Placed!</h1>
        <p class="sub">Thank you for your purchase. Your order is confirmed and being processed.</p>

        <div class="footer">
          <div class="track">
            <div class="fill" [style.animation-duration]="duration + 's'"></div>
          </div>
          <p class="label"><span class="dot"></span> Redirecting in {{ countdown }}s</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');

      :host {
        display: block;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }

      .scene {
        min-height: 100vh;
        background: #f0faf4;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card {
        background: #fff;
        border-radius: 24px;
        padding: 56px 40px 40px;
        width: min(420px, 92vw);
        text-align: center;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
        animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Check ── */
      .check-wrapper {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .check-svg {
        width: 72px;
        height: 72px;
        position: relative;
        z-index: 1;
      }

      .check-circle {
        fill: #22c55e;
        stroke: none;
        transform-origin: center;
        animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
      }

      @keyframes pop-in {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .check-mark {
        fill: none;
        stroke: #fff;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 40;
        stroke-dashoffset: 40;
        animation: draw 0.4s ease 0.7s forwards;
      }

      @keyframes draw {
        to {
          stroke-dashoffset: 0;
        }
      }

      .ripple {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid #22c55e;
        animation: ripple 1.8s ease-out infinite;
      }

      .r2 {
        animation-delay: 0.6s;
      }

      @keyframes ripple {
        from {
          transform: scale(0.8);
          opacity: 0.6;
        }
        to {
          transform: scale(1.8);
          opacity: 0;
        }
      }

      /* ── Text ── */
      .headline {
        font-size: 28px;
        font-weight: 600;
        color: #111;
        margin: 0 0 12px;
        animation: fade-up 0.4s ease 0.9s both;
      }

      .sub {
        font-size: 14px;
        font-weight: 300;
        line-height: 1.7;
        color: #6b7280;
        margin: 0 0 36px;
        animation: fade-up 0.4s ease 1s both;
      }

      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Footer ── */
      .footer {
        animation: fade-up 0.4s ease 1.1s both;
      }

      .track {
        height: 3px;
        background: #e5e7eb;
        border-radius: 99px;
        overflow: hidden;
        margin-bottom: 12px;
      }

      .fill {
        height: 100%;
        width: 0;
        background: #22c55e;
        border-radius: 99px;
        animation: fill linear forwards;
        animation-delay: 1.2s;
      }

      @keyframes fill {
        from {
          width: 0%;
        }
        to {
          width: 100%;
        }
      }

      .label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        color: #9ca3af;
        margin: 0;
      }

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22c55e;
        animation: blink 1.2s ease-in-out infinite;
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.2;
        }
      }
    `,
  ],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  duration = 5;
  countdown = 5;

  private interval: number | undefined;
  private timeout: number | undefined;

  ngOnInit() {
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) clearInterval(this.interval);
    }, 1000);

    this.timeout = setTimeout(() => {
      this.router.navigate(['/']);
    }, this.duration * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }
}
