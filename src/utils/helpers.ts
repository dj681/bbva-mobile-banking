import type { Transaction, TransactionType, CardNetwork } from '../types';

// ── ID generation ─────────────────────────────────────────────────────────────

/**
 * Generate a UUID v4-like string without external dependencies.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Async utilities ───────────────────────────────────────────────────────────

/** Promisified setTimeout. */
export function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ── Name utilities ────────────────────────────────────────────────────────────

/**
 * Get initials from a first and last name.
 * @example getInitials("Jean", "Dupont") → "JD"
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = (firstName ?? '').trim().charAt(0).toUpperCase();
  const last = (lastName ?? '').trim().charAt(0).toUpperCase();
  return `${first}${last}`;
}

// ── Transaction utilities ─────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  groceries: 'cart-outline',
  food: 'restaurant-outline',
  transport: 'car-outline',
  utilities: 'flash-outline',
  entertainment: 'film-outline',
  health: 'medkit-outline',
  shopping: 'bag-outline',
  housing: 'home-outline',
  income: 'trending-up-outline',
  transfer: 'swap-horizontal-outline',
  finance: 'wallet-outline',
  insurance: 'shield-outline',
  technology: 'laptop-outline',
  travel: 'airplane-outline',
  sports: 'fitness-outline',
  cash: 'cash-outline',
  fees: 'receipt-outline',
  education: 'school-outline',
  default: 'ellipse-outline',
};

/**
 * Return an icon name (Ionicons-compatible) for a transaction category.
 */
export function getTransactionIcon(category: string): string {
  return CATEGORY_ICONS[category.toLowerCase()] ?? CATEGORY_ICONS.default;
}

/**
 * Return a color hex code for a transaction type.
 */
export function getTransactionColor(type: TransactionType): string {
  const colors: Record<TransactionType, string> = {
    credit: '#2ECC71',
    debit: '#E74C3C',
    transfer: '#3498DB',
    payment: '#E67E22',
  };
  return colors[type] ?? '#95A5A6';
}

// ── Card utilities ────────────────────────────────────────────────────────────

/**
 * Return gradient color pair for a card network.
 */
export function getCardGradientColors(network: CardNetwork): string[] {
  const gradients: Record<CardNetwork, string[]> = {
    visa: ['#004481', '#1464A0'],
    mastercard: ['#1A1F71', '#00A1E0'],
    amex: ['#007B5E', '#00A86B'],
  };
  return gradients[network] ?? ['#2C3E50', '#3498DB'];
}

// ── Progress ──────────────────────────────────────────────────────────────────

/**
 * Calculate a progress percentage clamped to [0, 100].
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

// ── Transaction grouping / sorting ────────────────────────────────────────────

/**
 * Group transactions by their date (YYYY-MM-DD).
 */
export function groupTransactionsByDate(
  transactions: Transaction[],
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, txn) => {
    const day = txn.date.split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(txn);
    return acc;
  }, {});
}

/**
 * Sort transactions by a given field.
 * @param sortBy 'date' | 'amount' | 'category'
 */
export function sortTransactions(
  transactions: Transaction[],
  sortBy: string,
): Transaction[] {
  const copy = [...transactions];
  switch (sortBy) {
    case 'amount':
      return copy.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category, 'fr'));
    case 'date':
    default:
      return copy.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  }
}

// ── Greeting ──────────────────────────────────────────────────────────────────

/**
 * Return a time-appropriate French greeting.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

// ── String utilities ──────────────────────────────────────────────────────────

/**
 * Mask a string, keeping only the last N visible characters.
 * @example maskString("FR7630006000011234", 4) → "**************1234"
 */
export function maskString(str: string, visibleChars = 4): string {
  if (!str || str.length <= visibleChars) return str;
  const masked = '•'.repeat(str.length - visibleChars);
  return `${masked}${str.slice(-visibleChars)}`;
}

// ── Date utilities ────────────────────────────────────────────────────────────

/**
 * Check whether a date string represents a past date (expired).
 */
export function isExpired(date: string): boolean {
  return new Date(date).getTime() < Date.now();
}

/**
 * Return the absolute difference in calendar days between two ISO date strings.
 */
export function getDaysDifference(date1: string, date2: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const d1 = new Date(date1).setHours(0, 0, 0, 0);
  const d2 = new Date(date2).setHours(0, 0, 0, 0);
  return Math.abs(Math.round((d2 - d1) / MS_PER_DAY));
}

// ── File utilities ────────────────────────────────────────────────────────────

/**
 * Format a byte count as a human-readable file size.
 * @example formatFileSize(1536) → "1,5 Ko"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 o';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 ** 2)
    return `${(bytes / 1024).toFixed(1).replace('.', ',')} Ko`;
  if (bytes < 1024 ** 3)
    return `${(bytes / 1024 ** 2).toFixed(1).replace('.', ',')} Mo`;
  return `${(bytes / 1024 ** 3).toFixed(1).replace('.', ',')} Go`;
}
