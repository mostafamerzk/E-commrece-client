import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [],
  templateUrl: './form-field.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: block; width: 100%;',
  },
})
export class FormFieldComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) inputId!: string;
  @Input() error?: string | null;
}
