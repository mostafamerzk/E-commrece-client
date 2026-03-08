import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appMatch]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MatchValidatorDirective,
      multi: true,
    },
  ],
})
export class MatchValidatorDirective implements Validator {
  @Input('appMatch') matchTo: string = '';

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const parent = control.parent;
    if (!parent) {
      return null;
    }

    const targetControl = parent.get(this.matchTo);
    if (!targetControl) {
      return null;
    }

    if (control.value !== targetControl.value) {
      return { match: true };
    }

    return null;
  }
}
