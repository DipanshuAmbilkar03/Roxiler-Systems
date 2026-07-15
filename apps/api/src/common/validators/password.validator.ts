import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    if (value.length < 8 || value.length > 16) {
      return false;
    }
    const hasUppercase = /[A-Z]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    return hasUppercase && hasSpecial;
  }

  defaultMessage(): string {
    return 'password must be 8–16 characters and include at least one uppercase letter and one special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
