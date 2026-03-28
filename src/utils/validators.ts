/** RFC 5322 compliant email regex */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AmountValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an email address.
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate a password for strength requirements.
 * Rules: ≥8 chars, uppercase, lowercase, digit, special char.
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an IBAN using the mod-97 algorithm.
 */
export function validateIBAN(iban: string): boolean {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!IBAN_REGEX.test(clean)) return false;

  // Move first 4 chars to end and convert letters to numbers
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((c) => (isNaN(Number(c)) ? (c.charCodeAt(0) - 55).toString() : c))
    .join('');

  // Perform mod-97 check using BigInt for large numbers
  let remainder = BigInt(0);
  for (const char of numeric) {
    remainder = (remainder * 10n + BigInt(char)) % 97n;
  }

  return remainder === 1n;
}

/**
 * Validate a PIN (4–6 digits).
 */
export function validatePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Validate a monetary amount.
 */
export function validateAmount(
  amount: string | number,
  maxAmount?: number,
): AmountValidationResult {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;

  if (isNaN(num)) {
    return { valid: false, error: 'Le montant saisi est invalide.' };
  }
  if (num <= 0) {
    return { valid: false, error: 'Le montant doit être supérieur à 0 €.' };
  }
  if (maxAmount !== undefined && num > maxAmount) {
    return {
      valid: false,
      error: `Le montant ne peut pas dépasser ${maxAmount.toFixed(2)} €.`,
    };
  }

  return { valid: true };
}

/**
 * Validate a French or international phone number.
 */
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\s|-|\./g, '');
  // French mobile/landline: +33 or 0 followed by 9 digits
  return /^(\+33|0033|0)[1-9]\d{8}$/.test(clean);
}

/**
 * Validate a credit/debit card number using the Luhn algorithm.
 */
export function validateCardNumber(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate a card expiry date in MM/YY or MM/YYYY format.
 * Returns false if the card is expired.
 */
export function validateExpiryDate(expiryDate: string): boolean {
  const match = expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  // Convert 2-digit year to 4-digit
  if (year < 100) year += 2000;

  // Date uses 0-indexed months, so passing the 1-indexed month value directly
  // gives the 1st of the following month (e.g., month=12 → January 1 of year+1).
  const expiry = new Date(year, month, 1);
  return expiry > new Date();
}
