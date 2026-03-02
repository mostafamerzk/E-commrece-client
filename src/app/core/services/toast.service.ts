import { Injectable, inject } from '@angular/core';
import { ToastFacade } from '../tokens/app.tokens';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService implements ToastFacade {
  private messageService = inject(MessageService);

  show(message: string): void {
    this.info(message);
  }

  success(message: string, title: string = 'Success'): void {
    this.messageService.add({ severity: 'success', summary: title, detail: message });
  }

  error(message: string, title: string = 'Error'): void {
    this.messageService.add({ severity: 'error', summary: title, detail: message });
  }

  info(message: string, title: string = 'Info'): void {
    this.messageService.add({ severity: 'info', summary: title, detail: message });
  }

  warn(message: string, title: string = 'Warning'): void {
    this.messageService.add({ severity: 'warn', summary: title, detail: message });
  }
}
