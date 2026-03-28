import type { Transaction } from '../../types';
import {
  generateId,
  getInitials,
  getTransactionIcon,
  getTransactionColor,
  getCardGradientColors,
  calculateProgress,
  groupTransactionsByDate,
  sortTransactions,
  maskString,
  isExpired,
  getDaysDifference,
  formatFileSize,
  getGreeting,
} from '../helpers';

// ── generateId ────────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns unique values on successive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateId()));
    expect(ids.size).toBe(20);
  });

  it('matches UUID v4 format', () => {
    expect(generateId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

// ── getInitials ───────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns the first character of each name uppercased', () => {
    expect(getInitials('Jean', 'Dupont')).toBe('JD');
  });

  it('handles lowercase names', () => {
    expect(getInitials('marie', 'curie')).toBe('MC');
  });

  it('handles empty strings gracefully', () => {
    expect(getInitials('', '')).toBe('');
  });

  it('handles single-character names', () => {
    expect(getInitials('A', 'B')).toBe('AB');
  });
});

// ── getTransactionIcon ────────────────────────────────────────────────────────

describe('getTransactionIcon', () => {
  it('returns the grocery icon for the "groceries" category', () => {
    expect(getTransactionIcon('groceries')).toBe('cart-outline');
  });

  it('is case-insensitive', () => {
    expect(getTransactionIcon('FOOD')).toBe('restaurant-outline');
  });

  it('returns the default icon for an unknown category', () => {
    expect(getTransactionIcon('unknown-category-xyz')).toBe('ellipse-outline');
  });
});

// ── getTransactionColor ───────────────────────────────────────────────────────

describe('getTransactionColor', () => {
  it('returns green for credit transactions', () => {
    expect(getTransactionColor('credit')).toBe('#2ECC71');
  });

  it('returns red for debit transactions', () => {
    expect(getTransactionColor('debit')).toBe('#E74C3C');
  });

  it('returns blue for transfer transactions', () => {
    expect(getTransactionColor('transfer')).toBe('#3498DB');
  });

  it('returns orange for payment transactions', () => {
    expect(getTransactionColor('payment')).toBe('#E67E22');
  });
});

// ── getCardGradientColors ─────────────────────────────────────────────────────

describe('getCardGradientColors', () => {
  it('returns an array of two colours for visa', () => {
    const colours = getCardGradientColors('visa');
    expect(Array.isArray(colours)).toBe(true);
    expect(colours).toHaveLength(2);
  });

  it('returns different colours for mastercard', () => {
    const colours = getCardGradientColors('mastercard');
    expect(colours[0]).not.toBe(colours[1]);
  });

  it('returns a valid hex colour for amex', () => {
    const colours = getCardGradientColors('amex');
    colours.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });
});

// ── calculateProgress ─────────────────────────────────────────────────────────

describe('calculateProgress', () => {
  it('returns 50 for half of the target', () => {
    expect(calculateProgress(50, 100)).toBe(50);
  });

  it('clamps to 100 when current exceeds target', () => {
    expect(calculateProgress(200, 100)).toBe(100);
  });

  it('clamps to 0 when current is 0', () => {
    expect(calculateProgress(0, 100)).toBe(0);
  });

  it('returns 0 when target is 0 to avoid division by zero', () => {
    expect(calculateProgress(50, 0)).toBe(0);
  });

  it('returns 0 for a negative target', () => {
    expect(calculateProgress(50, -10)).toBe(0);
  });
});

// ── groupTransactionsByDate ───────────────────────────────────────────────────

const makeTransaction = (id: string, date: string): Transaction => ({
  id,
  accountId: 'acc1',
  type: 'debit',
  status: 'completed',
  amount: 10,
  currency: 'EUR',
  description: 'Test',
  category: 'shopping',
  reference: 'REF001',
  date,
  balance: 990,
});

describe('groupTransactionsByDate', () => {
  it('groups transactions by their date part', () => {
    const txns = [
      makeTransaction('1', '2024-01-15T10:00:00Z'),
      makeTransaction('2', '2024-01-15T18:30:00Z'),
      makeTransaction('3', '2024-01-16T09:00:00Z'),
    ];
    const groups = groupTransactionsByDate(txns);
    expect(Object.keys(groups)).toHaveLength(2);
    expect(groups['2024-01-15']).toHaveLength(2);
    expect(groups['2024-01-16']).toHaveLength(1);
  });

  it('returns an empty object for an empty array', () => {
    expect(groupTransactionsByDate([])).toEqual({});
  });
});

// ── sortTransactions ──────────────────────────────────────────────────────────

describe('sortTransactions', () => {
  const txns: Transaction[] = [
    { ...makeTransaction('1', '2024-01-01T00:00:00Z'), amount: 50, category: 'transport' },
    { ...makeTransaction('2', '2024-01-03T00:00:00Z'), amount: 200, category: 'food' },
    { ...makeTransaction('3', '2024-01-02T00:00:00Z'), amount: 10, category: 'health' },
  ];

  it('sorts by date descending by default', () => {
    const sorted = sortTransactions(txns, 'date');
    expect(sorted[0].id).toBe('2');
    expect(sorted[2].id).toBe('1');
  });

  it('sorts by amount descending', () => {
    const sorted = sortTransactions(txns, 'amount');
    expect(sorted[0].amount).toBe(200);
    expect(sorted[2].amount).toBe(10);
  });

  it('sorts by category alphabetically', () => {
    const sorted = sortTransactions(txns, 'category');
    expect(sorted[0].category).toBe('food');
    expect(sorted[2].category).toBe('transport');
  });

  it('does not mutate the original array', () => {
    const original = [...txns];
    sortTransactions(txns, 'amount');
    expect(txns).toEqual(original);
  });
});

// ── maskString ────────────────────────────────────────────────────────────────

describe('maskString', () => {
  it('masks all but the last 4 characters', () => {
    const result = maskString('FR7630006000011234567800189');
    expect(result.endsWith('0189')).toBe(true);
    expect(result).toContain('•');
  });

  it('does not mask strings shorter than or equal to visibleChars', () => {
    expect(maskString('1234', 4)).toBe('1234');
  });

  it('respects a custom visibleChars count', () => {
    const result = maskString('ABCDEF', 2);
    expect(result.endsWith('EF')).toBe(true);
    expect(result).toContain('•');
  });

  it('returns an empty string unchanged', () => {
    expect(maskString('', 4)).toBe('');
  });
});

// ── isExpired ─────────────────────────────────────────────────────────────────

describe('isExpired', () => {
  it('returns true for a past date', () => {
    expect(isExpired('2000-01-01')).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isExpired('2099-12-31')).toBe(false);
  });
});

// ── getDaysDifference ─────────────────────────────────────────────────────────

describe('getDaysDifference', () => {
  it('returns 1 for consecutive days', () => {
    expect(getDaysDifference('2024-01-01', '2024-01-02')).toBe(1);
  });

  it('returns 0 for the same date', () => {
    expect(getDaysDifference('2024-06-15', '2024-06-15')).toBe(0);
  });

  it('returns the absolute difference (order-independent)', () => {
    expect(getDaysDifference('2024-01-10', '2024-01-05')).toBe(5);
  });
});

// ── formatFileSize ────────────────────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 o');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1,5 Ko');
  });

  it('formats megabytes', () => {
    const result = formatFileSize(1024 * 1024 * 2.5);
    expect(result).toContain('Mo');
  });

  it('formats gigabytes', () => {
    const result = formatFileSize(1024 ** 3 * 1.2);
    expect(result).toContain('Go');
  });

  it('returns "0 o" for negative values', () => {
    expect(formatFileSize(-1)).toBe('0 o');
  });
});

// ── getGreeting ───────────────────────────────────────────────────────────────

describe('getGreeting', () => {
  it('returns one of the three expected French greetings', () => {
    const greetings = ['Bonjour', 'Bon après-midi', 'Bonsoir'];
    expect(greetings).toContain(getGreeting());
  });
});
