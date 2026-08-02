import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validation decorator that validates if an email is an educational email.
 * Ensures the domain portion of the email contains '.edu'.
 */
export function IsEduEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEduEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const parts = value.split('@');
          if (parts.length !== 2) return false;
          const domain = parts[1];
          return domain.toLowerCase().includes('.edu');
        },
        defaultMessage(args: ValidationArguments) {
          return 'Email must be an educational email (e.g. contain .edu in the domain portion)';
        },
      },
    });
  };
}
