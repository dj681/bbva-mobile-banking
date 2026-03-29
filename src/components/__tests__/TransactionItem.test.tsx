import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TransactionItem } from '../banking/TransactionItem';
import type { Transaction } from '../../types';

// Use a fixed date in the past so that "Today/Yesterday" formatting is deterministic
const FIXED_DATE = '2020-01-01T10:00:00Z';

const mockTransaction: Transaction = {
  id: 'txn1',
  accountId: 'acc1',
  type: 'debit',
  status: 'completed',
  amount: 45.5,
  currency: 'USD',
  description: 'Achat en ligne',
  merchant: 'Amazon',
  category: 'shopping',
  reference: 'REF001',
  date: FIXED_DATE,
  balance: 1000,
};

describe('TransactionItem component', () => {
  it('renders the merchant name when available', () => {
    const { getByText } = render(<TransactionItem transaction={mockTransaction} />);
    expect(getByText('Amazon')).toBeTruthy();
  });

  it('falls back to the description when merchant is absent', () => {
    const noMerchant = { ...mockTransaction, merchant: undefined };
    const { getByText } = render(<TransactionItem transaction={noMerchant} />);
    expect(getByText('Achat en ligne')).toBeTruthy();
  });

  it('shows a negative amount for a debit transaction', () => {
    const { getByText } = render(<TransactionItem transaction={mockTransaction} />);
    // Amount text contains a minus sign (es-ES locale: -45,50 US$)
    const amountEl = getByText(/-45[,.]50/);
    expect(amountEl).toBeTruthy();
  });

  it('shows a positive amount for a credit transaction', () => {
    const credit = { ...mockTransaction, type: 'credit' as const };
    const { getByText } = render(<TransactionItem transaction={credit} />);
    // es-ES locale: +45,50 US$
    expect(getByText(/\+45[,.]50/)).toBeTruthy();
  });

  it('calls onPress with the transaction when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <TransactionItem transaction={mockTransaction} onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(mockTransaction);
  });

  it('shows the pending badge for a pending transaction', () => {
    const pending = { ...mockTransaction, status: 'pending' as const };
    const { getByText } = render(<TransactionItem transaction={pending} />);
    expect(getByText('pending')).toBeTruthy();
  });

  it('shows the failed badge for a failed transaction', () => {
    const failed = { ...mockTransaction, status: 'failed' as const };
    const { getByText } = render(<TransactionItem transaction={failed} />);
    expect(getByText('failed')).toBeTruthy();
  });

  it('does not show a status badge for a completed transaction', () => {
    const { queryByText } = render(<TransactionItem transaction={mockTransaction} />);
    expect(queryByText('completed')).toBeNull();
  });

  it('renders without crashing when onPress is not provided', () => {
    expect(() =>
      render(<TransactionItem transaction={mockTransaction} />),
    ).not.toThrow();
  });

  it('has a meaningful accessibility label', () => {
    const { getByRole } = render(<TransactionItem transaction={mockTransaction} />);
    const btn = getByRole('button');
    // The accessibility label is built from transaction.description and the formatted amount
    expect(btn.props.accessibilityLabel).toContain('Achat en ligne');
    expect(btn.props.accessibilityLabel).toContain('45,50');
  });

  it('renders all known categories without crashing', () => {
    const categories = [
      'food', 'transport', 'shopping', 'entertainment', 'health',
      'utilities', 'transfer', 'payment', 'salary', 'investment', 'unknown',
    ];
    categories.forEach((category) => {
      const txn = { ...mockTransaction, category };
      expect(() => render(<TransactionItem transaction={txn} />)).not.toThrow();
    });
  });
});
