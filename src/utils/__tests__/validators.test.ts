import {
  validateEmail,
  validatePassword,
  validateIBAN,
  validatePin,
  validateAmount,
  validatePhone,
  validateCardNumber,
  validateExpiryDate,
} from '../validators';

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('trims leading/trailing whitespace before validation', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('Secur3P@ss');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a password that is too short', () => {
    const result = validatePassword('Sh0rt!');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('8 caractères'))).toBe(true);
  });

  it('rejects a password without uppercase', () => {
    const result = validatePassword('secur3p@ss');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('majuscule'))).toBe(true);
  });

  it('rejects a password without lowercase', () => {
    const result = validatePassword('SECUR3P@SS');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('minuscule'))).toBe(true);
  });

  it('rejects a password without a digit', () => {
    const result = validatePassword('SecureP@ss');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('chiffre'))).toBe(true);
  });

  it('rejects a password without a special character', () => {
    const result = validatePassword('Secur3Pass');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('spécial'))).toBe(true);
  });

  it('collects multiple errors at once', () => {
    const result = validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateIBAN', () => {
  // A well-known valid French IBAN (check digits computed via mod-97)
  it('accepts a valid French IBAN', () => {
    expect(validateIBAN('FR3230006000011234567800189')).toBe(true);
  });

  it('accepts IBAN with spaces', () => {
    expect(validateIBAN('FR32 3000 6000 0112 3456 7800 189')).toBe(true);
  });

  it('rejects an IBAN with wrong check digits', () => {
    // Change check digits to an invalid value
    expect(validateIBAN('FR0030006000011234567800189')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateIBAN('')).toBe(false);
  });

  it('rejects a random string', () => {
    expect(validateIBAN('NOT_AN_IBAN')).toBe(false);
  });
});

describe('validatePin', () => {
  it('accepts a 4-digit PIN', () => {
    expect(validatePin('1234')).toBe(true);
  });

  it('accepts a 6-digit PIN', () => {
    expect(validatePin('123456')).toBe(true);
  });

  it('rejects a 3-digit PIN', () => {
    expect(validatePin('123')).toBe(false);
  });

  it('rejects a 7-digit PIN', () => {
    expect(validatePin('1234567')).toBe(false);
  });

  it('rejects a PIN containing letters', () => {
    expect(validatePin('12ab')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validatePin('')).toBe(false);
  });
});

describe('validateAmount', () => {
  it('accepts a valid positive number', () => {
    expect(validateAmount(100).valid).toBe(true);
  });

  it('accepts a valid positive string', () => {
    expect(validateAmount('50.00').valid).toBe(true);
  });

  it('accepts a comma-separated decimal string', () => {
    expect(validateAmount('1234,56').valid).toBe(true);
  });

  it('rejects zero', () => {
    const result = validateAmount(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('supérieur');
  });

  it('rejects a negative value', () => {
    const result = validateAmount(-10);
    expect(result.valid).toBe(false);
  });

  it('rejects a non-numeric string', () => {
    const result = validateAmount('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalide');
  });

  it('rejects an amount exceeding the maximum', () => {
    const result = validateAmount(200, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100.00');
  });

  it('accepts an amount exactly equal to the maximum', () => {
    expect(validateAmount(100, 100).valid).toBe(true);
  });
});

describe('validatePhone', () => {
  it('accepts a valid French mobile number', () => {
    expect(validatePhone('0612345678')).toBe(true);
  });

  it('accepts a number with +33 prefix', () => {
    expect(validatePhone('+33612345678')).toBe(true);
  });

  it('accepts a number with spaces', () => {
    expect(validatePhone('06 12 34 56 78')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(validatePhone('')).toBe(false);
  });

  it('rejects a number that is too short', () => {
    expect(validatePhone('0612345')).toBe(false);
  });
});

describe('validateCardNumber', () => {
  // Visa test number that passes the Luhn algorithm
  it('accepts a valid Luhn card number', () => {
    expect(validateCardNumber('4111111111111111')).toBe(true);
  });

  it('accepts a card number with spaces', () => {
    expect(validateCardNumber('4111 1111 1111 1111')).toBe(true);
  });

  it('rejects a number that fails Luhn', () => {
    expect(validateCardNumber('1234567890123456')).toBe(false);
  });

  it('rejects a number that is too short', () => {
    expect(validateCardNumber('123456789012')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateCardNumber('')).toBe(false);
  });
});

describe('validateExpiryDate', () => {
  it('accepts a valid future expiry in MM/YY format', () => {
    // Use a date well in the future
    expect(validateExpiryDate('12/99')).toBe(true);
  });

  it('accepts a valid future expiry in MM/YYYY format', () => {
    expect(validateExpiryDate('12/2099')).toBe(true);
  });

  it('rejects a date in the past', () => {
    expect(validateExpiryDate('01/20')).toBe(false);
  });

  it('rejects invalid month 00', () => {
    expect(validateExpiryDate('00/30')).toBe(false);
  });

  it('rejects invalid month 13', () => {
    expect(validateExpiryDate('13/30')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateExpiryDate('')).toBe(false);
  });

  it('rejects a random string', () => {
    expect(validateExpiryDate('not/a/date')).toBe(false);
  });
});
