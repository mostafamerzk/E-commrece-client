import { Component, Input, forwardRef, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [],
  templateUrl: './password-input.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: block; width: 100%;',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = '••••••••';
  @Input() disabled: boolean = false;
  @Input() iconPath?: string;
  @Input() iconViewBox: string = '0 0 24 24';

  value: string = '';
  showPassword = signal(false);

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  writeValue(value: string | undefined | null): void {
    if (value !== undefined && value !== null) {
      this.value = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
