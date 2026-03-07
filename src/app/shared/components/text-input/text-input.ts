import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [],
  templateUrl: './text-input.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: block; width: 100%;',
  },
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() type: 'text' | 'email' | 'tel' = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() iconPath?: string;
  @Input() iconViewBox: string = '0 0 24 24';

  value: string = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  public ngControl = inject(NgControl, { self: true, optional: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isInvalid(): boolean {
    return !!(
      this.ngControl &&
      this.ngControl.invalid &&
      (this.ngControl.dirty || this.ngControl.touched)
    );
  }

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
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
