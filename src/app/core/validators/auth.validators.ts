import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noWhitespaceValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().length === 0 ? { whitespace: true } : null;
};

export const nameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (value !== trimmedValue) {
    return { whitespace: true };
  }

  if (trimmedValue.length < 2) {
    return { minlength: true };
  }

  return null;
};

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

export const matchFieldsValidator = (firstField: string, secondField: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const firstValue = control.get(firstField)?.value;
    const secondValue = control.get(secondField)?.value;

    if (!firstValue || !secondValue) {
      return null;
    }

    return firstValue === secondValue ? null : { passwordMismatch: true };
  };
};
