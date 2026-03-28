import accountsReducer, {
  setAccounts,
  setSelectedAccount,
  setTransactions,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
  clearFilters,
  addTransaction,
  fetchAccounts,
  fetchTransactions,
  fetchAccountDetails,
} from '../slices/accountsSlice';
import type { AccountsState, Account, Transaction } from '../../types';

const initialState: AccountsState = {
  accounts: [],
  selectedAccountId: null,
  transactions: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: {},
  searchQuery: '',
};

const mockAccount: Account = {
  id: 'acc1',
  accountNumber: '00012345678',
  iban: 'FR7630006000011234567800189',
  type: 'checking',
  name: 'Compte Courant',
  balance: 1500,
  availableBalance: 1400,
  currency: 'EUR',
  isDefault: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockTransaction: Transaction = {
  id: 'txn1',
  accountId: 'acc1',
  type: 'debit',
  status: 'completed',
  amount: 50,
  currency: 'EUR',
  description: 'Supermarché',
  category: 'groceries',
  reference: 'REF001',
  date: '2024-06-01T10:00:00Z',
  balance: 1450,
};

describe('accountsSlice — synchronous actions', () => {
  it('returns the initial state when called with undefined', () => {
    expect(accountsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setAccounts replaces the accounts list', () => {
    const state = accountsReducer(initialState, setAccounts([mockAccount]));
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0]).toEqual(mockAccount);
  });

  it('setSelectedAccount stores the selected account id', () => {
    const state = accountsReducer(initialState, setSelectedAccount('acc1'));
    expect(state.selectedAccountId).toBe('acc1');
  });

  it('setSelectedAccount can clear the selection with null', () => {
    const selected = accountsReducer(initialState, setSelectedAccount('acc1'));
    const state = accountsReducer(selected, setSelectedAccount(null));
    expect(state.selectedAccountId).toBeNull();
  });

  it('setTransactions stores transactions under the given accountId', () => {
    const state = accountsReducer(
      initialState,
      setTransactions({ accountId: 'acc1', transactions: [mockTransaction] }),
    );
    expect(state.transactions['acc1']).toHaveLength(1);
    expect(state.transactions['acc1'][0]).toEqual(mockTransaction);
  });

  it('setLoading sets isLoading', () => {
    const state = accountsReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);
    const state2 = accountsReducer(state, setLoading(false));
    expect(state2.isLoading).toBe(false);
  });

  it('setError stores an error message', () => {
    const state = accountsReducer(initialState, setError('Network error'));
    expect(state.error).toBe('Network error');
  });

  it('setError clears the error when passed null', () => {
    const errState = accountsReducer(initialState, setError('Oops'));
    const state = accountsReducer(errState, setError(null));
    expect(state.error).toBeNull();
  });

  it('setFilters stores filters', () => {
    const state = accountsReducer(initialState, setFilters({ type: 'debit', minAmount: 10 }));
    expect(state.filters).toEqual({ type: 'debit', minAmount: 10 });
  });

  it('setSearchQuery stores the query string', () => {
    const state = accountsReducer(initialState, setSearchQuery('supermarché'));
    expect(state.searchQuery).toBe('supermarché');
  });

  it('clearFilters resets filters and searchQuery', () => {
    const withFilters = accountsReducer(
      accountsReducer(initialState, setFilters({ type: 'credit' })),
      setSearchQuery('query'),
    );
    const state = accountsReducer(withFilters, clearFilters());
    expect(state.filters).toEqual({});
    expect(state.searchQuery).toBe('');
  });

  it('addTransaction prepends a transaction to the list', () => {
    const withOne = accountsReducer(
      initialState,
      setTransactions({ accountId: 'acc1', transactions: [mockTransaction] }),
    );
    const newTxn: Transaction = { ...mockTransaction, id: 'txn2', amount: 200 };
    const state = accountsReducer(withOne, addTransaction(newTxn));
    expect(state.transactions['acc1'][0].id).toBe('txn2');
    expect(state.transactions['acc1']).toHaveLength(2);
  });

  it('addTransaction creates the account list if it does not exist', () => {
    const state = accountsReducer(initialState, addTransaction(mockTransaction));
    expect(state.transactions['acc1']).toHaveLength(1);
  });
});

describe('accountsSlice — fetchAccounts async thunk', () => {
  it('sets isLoading=true and clears error on pending', () => {
    const state = accountsReducer(
      { ...initialState, error: 'old error' },
      { type: fetchAccounts.pending.type },
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores accounts and updates lastUpdated on fulfilled', () => {
    const before = new Date().toISOString();
    const state = accountsReducer(initialState, {
      type: fetchAccounts.fulfilled.type,
      payload: [mockAccount],
    });
    const after = new Date().toISOString();
    expect(state.isLoading).toBe(false);
    expect(state.accounts).toHaveLength(1);
    expect(state.lastUpdated).not.toBeNull();
    // lastUpdated should be between before and after
    expect(state.lastUpdated! >= before).toBe(true);
    expect(state.lastUpdated! <= after).toBe(true);
  });

  it('stores the error on rejected', () => {
    const state = accountsReducer(initialState, {
      type: fetchAccounts.rejected.type,
      payload: 'Failed to fetch accounts',
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Failed to fetch accounts');
  });
});

describe('accountsSlice — fetchTransactions async thunk', () => {
  it('sets isLoading=true on pending', () => {
    const state = accountsReducer(initialState, { type: fetchTransactions.pending.type });
    expect(state.isLoading).toBe(true);
  });

  it('stores transactions under the correct accountId on fulfilled', () => {
    const state = accountsReducer(initialState, {
      type: fetchTransactions.fulfilled.type,
      payload: { accountId: 'acc1', transactions: [mockTransaction] },
    });
    expect(state.isLoading).toBe(false);
    expect(state.transactions['acc1']).toHaveLength(1);
  });

  it('stores the error on rejected', () => {
    const state = accountsReducer(initialState, {
      type: fetchTransactions.rejected.type,
      payload: 'Fetch failed',
    });
    expect(state.error).toBe('Fetch failed');
  });
});

describe('accountsSlice — fetchAccountDetails async thunk', () => {
  it('sets isLoading=true on pending', () => {
    const state = accountsReducer(initialState, { type: fetchAccountDetails.pending.type });
    expect(state.isLoading).toBe(true);
  });

  it('appends a new account on fulfilled when not already in the list', () => {
    const state = accountsReducer(initialState, {
      type: fetchAccountDetails.fulfilled.type,
      payload: mockAccount,
    });
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0]).toEqual(mockAccount);
  });

  it('updates an existing account in the list on fulfilled', () => {
    const existingState: AccountsState = { ...initialState, accounts: [mockAccount] };
    const updatedAccount: Account = { ...mockAccount, balance: 9999 };
    const state = accountsReducer(existingState, {
      type: fetchAccountDetails.fulfilled.type,
      payload: updatedAccount,
    });
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0].balance).toBe(9999);
  });

  it('stores the error on rejected', () => {
    const state = accountsReducer(initialState, {
      type: fetchAccountDetails.rejected.type,
      payload: 'Account not found',
    });
    expect(state.error).toBe('Account not found');
  });
});
