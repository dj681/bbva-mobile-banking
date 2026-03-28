import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a number as a currency string.
 * @example formatCurrency(1234.5) → "1 234,50 €"
 */
export function formatCurrency(
  amount: number,
  currency = 'EUR',
  locale = 'fr-FR',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object.
 * @param date ISO string or Date
 * @param fmt date-fns format string (default: 'dd/MM/yyyy')
 */
export function formatDate(
  date: string | Date,
  fmt = 'dd/MM/yyyy',
): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '—';
    return format(d, fmt, { locale: fr });
  } catch {
    return '—';
  }
}

/**
 * Format a date as a relative string in French.
 * @example formatRelativeDate("2024-01-13") → "il y a 2 jours"
 */
export function formatRelativeDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '—';
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return '—';
  }
}

/**
 * Mask an account number, showing only the last 4 digits.
 * @example formatAccountNumber("00012345678") → "••• 5678"
 */
export function formatAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const visible = accountNumber.slice(-4);
  return `••• ${visible}`;
}

/**
 * Format a card number in masked display format.
 * @example formatCardNumber("1234567812345678") → "**** **** **** 5678"
 */
export function formatCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 4) return cardNumber;
  const last4 = clean.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Format an IBAN with spaces every 4 characters.
 * @example formatIBAN("FR7630006000011234567800189") → "FR76 3000 6000 0112 3456 7800 189"
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Format a French phone number.
 * @example formatPhoneNumber("0612345678") → "06 12 34 56 78"
 */
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('33') && clean.length === 11) {
    const local = clean.slice(2);
    return `+33 ${local.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

/**
 * Format a number as a percentage.
 * @example formatPercentage(8.19) → "8,19 %"
 */
export function formatPercentage(value: number, decimals = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a large number with K/M suffix.
 * @example formatLargeNumber(1200000) → "1,2M"
 */
export function formatLargeNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return `${sign}${abs.toFixed(0)}`;
}

/**
 * Truncate text to a maximum length, appending '…' when truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
