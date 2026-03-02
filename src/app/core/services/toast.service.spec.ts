import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { MessageService } from 'primeng/api';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ToastService', () => {
  let service: ToastService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ToastService,
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call messageService.add with success severity', () => {
    service.success('Test Message', 'Test Title');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Test Title',
      detail: 'Test Message',
    });
  });

  it('should call messageService.add with error severity', () => {
    service.error('Error Message');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error Message',
    });
  });

  it('should call messageService.add with info severity via show()', () => {
    service.show('Info Message');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info',
      detail: 'Info Message',
    });
  });

  it('should call messageService.add with warn severity', () => {
    service.warn('Warning Message');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Warning Message',
    });
  });
});
