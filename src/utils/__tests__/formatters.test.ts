import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  formatAccountNumber,
  formatCardNumber,
  formatIBAN,
  formatPhoneNumber,
  formatPercentage,
  formatLargeNumber,
  truncateText,
} from '../formatters';

describe('formatCurrency', () => {
  it('formats a positive euro amount in French locale', () => {
    const result = formatCurrency(1234.5);
    // French locale separates thousands with a space and uses a comma decimal
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('50');
    expect(result).toContain('€');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('formats a negative amount', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('-');
    expect(result).toContain('50');
  });

  it('respects a custom currency', () => {
    const result = formatCurrency(100, 'USD', 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('100');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date string with default format', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('15/03/2024');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 0, 5)); // Jan 5, 2024
    expect(result).toBe('05/01/2024');
  });

  it('returns "—" for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('accepts a custom format', () => {
    const result = formatDate('2024-12-01', 'yyyy');
    expect(result).toBe('2024');
  });
});

describe('formatRelativeDate', () => {
  it('returns a relative French string for a recent date', () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeDate(recentDate);
    // Should contain French relative wording
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('—');
  });

  it('returns "—" for an invalid date', () => {
    expect(formatRelativeDate('invalid')).toBe('—');
  });
});

describe('formatAccountNumber', () => {
  it('masks all but the last 4 digits', () => {
    expect(formatAccountNumber('00012345678')).toBe('••• 5678');
  });

  it('returns the original value for short strings', () => {
    expect(formatAccountNumber('123')).toBe('123');
  });

  it('returns empty string for empty input', () => {
    expect(formatAccountNumber('')).toBe('');
  });
});

describe('formatCardNumber', () => {
  it('masks a 16-digit card number', () => {
    expect(formatCardNumber('1234567812345678')).toBe('**** **** **** 5678');
  });

  it('strips non-digit characters before masking', () => {
    expect(formatCardNumber('1234-5678-1234-5678')).toBe('**** **** **** 5678');
  });

  it('returns the original value for very short input', () => {
    expect(formatCardNumber('123')).toBe('123');
  });
});

describe('formatIBAN', () => {
  it('formats a French IBAN with spaces every 4 characters', () => {
    const result = formatIBAN('FR7630006000011234567800189');
    expect(result).toBe('FR76 3000 6000 0112 3456 7800 189');
  });

  it('normalises lowercase input', () => {
    const result = formatIBAN('fr7630006000011234567800189');
    expect(result).toContain('FR76');
  });

  it('handles an already-spaced IBAN', () => {
    const result = formatIBAN('FR76 3000 6000 0112 3456 7800 189');
    expect(result).toBe('FR76 3000 6000 0112 3456 7800 189');
  });
});

describe('formatPhoneNumber', () => {
  it('formats a 10-digit French number', () => {
    expect(formatPhoneNumber('0612345678')).toBe('06 12 34 56 78');
  });

  it('formats an 11-digit number with +33 prefix', () => {
    const result = formatPhoneNumber('33612345678');
    expect(result).toContain('+33');
    expect(result).toContain('6');
  });

  it('returns the original value for unrecognised format', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

describe('formatPercentage', () => {
  it('formats a percentage with French locale', () => {
    const result = formatPercentage(8.19);
    // Should contain the number and the percent sign
    expect(result).toContain('8');
    expect(result).toContain('%');
  });

  it('formats 0%', () => {
    const result = formatPercentage(0);
    expect(result).toContain('0');
  });
});

describe('formatLargeNumber', () => {
  it('formats millions', () => {
    expect(formatLargeNumber(1200000)).toBe('1,2M');
  });

  it('formats thousands', () => {
    expect(formatLargeNumber(1500)).toBe('1,5K');
  });

  it('formats numbers below 1000 without suffix', () => {
    expect(formatLargeNumber(999)).toBe('999');
  });

  it('handles negative values', () => {
    expect(formatLargeNumber(-1200000)).toBe('-1,2M');
    expect(formatLargeNumber(-1500)).toBe('-1,5K');
  });
});

describe('truncateText', () => {
  it('returns unchanged text that fits within maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text that exceeds maxLength and appends ellipsis', () => {
    const result = truncateText('Hello World', 8);
    expect(result.length).toBe(8);
    expect(result.endsWith('…')).toBe(true);
  });

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });
});
