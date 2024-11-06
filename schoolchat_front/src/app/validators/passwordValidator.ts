import { FormGroup } from '@angular/forms';

export function PasswordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { 'passwordMismatch': true };
  }
  return null;
}