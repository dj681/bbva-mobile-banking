import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccountCard } from '../banking/AccountCard';
import type { Account } from '../../types';

const mockAccount: Account = {
  id: 'acc1',
  accountNumber: '00012345678',
  iban: 'FR7630006000011234567800189',
  type: 'checking',
  name: 'Compte Courant',
  balance: 1500.75,
  availableBalance: 1400.0,
  currency: 'EUR',
  isDefault: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('AccountCard component', () => {
  it('renders the account name', () => {
    const { getByText } = render(<AccountCard account={mockAccount} />);
    expect(getByText('Compte Courant')).toBeTruthy();
  });

  it('displays the masked account number', () => {
    const { getByText } = render(<AccountCard account={mockAccount} />);
    // Last 4 digits of '00012345678' are '5678'
    expect(getByText('•••• 5678')).toBeTruthy();
  });

  it('shows the balance by default', () => {
    const { getByText } = render(<AccountCard account={mockAccount} />);
    // Formatted in es-ES locale: 1.500,75 € or 1500,75 €
    expect(getByText(/1[.,]?500[,.]75/)).toBeTruthy();
  });

  it('shows the account type label', () => {
    const { getByText } = render(<AccountCard account={mockAccount} />);
    expect(getByText('Corriente')).toBeTruthy();
  });

  it('calls onPress with the account when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <AccountCard account={mockAccount} onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(mockAccount);
  });

  it('shows "Inactiva" pill when account is not active', () => {
    const inactive = { ...mockAccount, isActive: false };
    const { getByText } = render(<AccountCard account={inactive} />);
    expect(getByText('Inactiva')).toBeTruthy();
  });

  it('does not show "Inactiva" when account is active', () => {
    const { queryByText } = render(<AccountCard account={mockAccount} />);
    expect(queryByText('Inactiva')).toBeNull();
  });

  it('renders all account types without crashing', () => {
    const types = ['checking', 'savings', 'investment', 'credit'] as const;
    types.forEach((type) => {
      const { getByText } = render(
        <AccountCard key={type} account={{ ...mockAccount, type }} />,
      );
      expect(getByText(mockAccount.name)).toBeTruthy();
    });
  });

  it('renders in compact mode without crashing', () => {
    const { getByText } = render(
      <AccountCard account={mockAccount} compact />,
    );
    expect(getByText('Compte Courant')).toBeTruthy();
  });

  it('has correct accessibility label including account name and balance', () => {
    const { getByRole } = render(<AccountCard account={mockAccount} />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toContain('Compte Courant');
    expect(btn.props.accessibilityLabel).toContain('1500,75');
  });
});
