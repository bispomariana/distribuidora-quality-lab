import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';

describe('CustomerEntity', () => {
  const validProps = {
    name: 'João Silva',
    document: '52998224725',
    email: 'joao@example.com',
    phone: '11987654321',
  };

  describe('create', () => {
    it('when valid props are provided, then creates CustomerEntity', () => {
      const customer = CustomerEntity.create(validProps);

      expect(customer.name).toBe('João Silva');
      expect(customer.document).toBe('52998224725');
      expect(customer.email).toBe('joao@example.com');
      expect(customer.phone).toBe('11987654321');
    });

    it('when phone has formatting, then stores only digits', () => {
      const customer = CustomerEntity.create({
        ...validProps,
        phone: '(11) 98765-4321',
      });

      expect(customer.phone).toBe('11987654321');
    });
  });

  describe('name validation', () => {
    it('when name is empty, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, name: '' }),
      ).toThrow(ValidationException);
    });

    it('when name is only whitespace, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, name: '   ' }),
      ).toThrow(ValidationException);
    });

    it('when name exceeds 150 characters, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, name: 'A'.repeat(151) }),
      ).toThrow(ValidationException);
    });

    it('when name is exactly 150 characters, then creates successfully', () => {
      const customer = CustomerEntity.create({
        ...validProps,
        name: 'A'.repeat(150),
      });

      expect(customer.name).toHaveLength(150);
    });
  });

  describe('email validation', () => {
    it('when email has no @, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, email: 'joaoexample.com' }),
      ).toThrow(ValidationException);
    });

    it('when email has no domain after @, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, email: 'joao@' }),
      ).toThrow(ValidationException);
    });

    it('when email domain has no dot, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, email: 'joao@example' }),
      ).toThrow(ValidationException);
    });

    it('when email exceeds 254 characters, then throws ValidationException', () => {
      const longEmail = 'a'.repeat(243) + '@example.com';
      expect(() =>
        CustomerEntity.create({ ...validProps, email: longEmail }),
      ).toThrow(ValidationException);
    });

    it('when email is exactly 254 characters, then creates successfully', () => {
      const email254 = 'a'.repeat(242) + '@example.com';
      const customer = CustomerEntity.create({ ...validProps, email: email254 });

      expect(customer.email).toBe(email254);
    });
  });

  describe('phone validation', () => {
    it('when phone has fewer than 10 digits, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, phone: '123456789' }),
      ).toThrow(ValidationException);
    });

    it('when phone has more than 11 digits, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, phone: '123456789012' }),
      ).toThrow(ValidationException);
    });

    it('when phone has exactly 10 digits, then creates successfully', () => {
      const customer = CustomerEntity.create({
        ...validProps,
        phone: '1198765432',
      });

      expect(customer.phone).toBe('1198765432');
    });
  });

  describe('document validation', () => {
    it('when CPF is invalid, then throws ValidationException', () => {
      expect(() =>
        CustomerEntity.create({ ...validProps, document: '12345678901' }),
      ).toThrow(ValidationException);
    });

    it('when CNPJ is valid, then creates successfully', () => {
      const customer = CustomerEntity.create({
        ...validProps,
        document: '11222333000181',
      });

      expect(customer.document).toBe('11222333000181');
    });
  });

  describe('update', () => {
    it('when updating name with valid value, then updates name', () => {
      const customer = CustomerEntity.create(validProps);
      customer.update({ name: 'Maria Souza' });

      expect(customer.name).toBe('Maria Souza');
    });

    it('when updating email with valid value, then updates email', () => {
      const customer = CustomerEntity.create(validProps);
      customer.update({ email: 'maria@example.com' });

      expect(customer.email).toBe('maria@example.com');
    });

    it('when updating phone with valid value, then updates phone', () => {
      const customer = CustomerEntity.create(validProps);
      customer.update({ phone: '2198765432' });

      expect(customer.phone).toBe('2198765432');
    });

    it('when updating name with invalid value, then throws ValidationException', () => {
      const customer = CustomerEntity.create(validProps);

      expect(() => customer.update({ name: '' })).toThrow(ValidationException);
    });

    it('when updating email with invalid value, then throws ValidationException', () => {
      const customer = CustomerEntity.create(validProps);

      expect(() => customer.update({ email: 'invalid' })).toThrow(
        ValidationException,
      );
    });

    it('when updating phone with invalid value, then throws ValidationException', () => {
      const customer = CustomerEntity.create(validProps);

      expect(() => customer.update({ phone: '123' })).toThrow(
        ValidationException,
      );
    });
  });
});
