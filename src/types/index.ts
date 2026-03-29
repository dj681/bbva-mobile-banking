// User & Auth types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  birthDate?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  isPinEnabled: boolean;
  pin: string | null;
  error: string | null;
  sessionExpiry: string | null;
  twoFactorPending: boolean;
}

// Account types
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';
export type TransactionType = 'debit' | 'credit' | 'transfer' | 'payment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Account {
  id: string;
  accountNumber: string;
  iban: string;
  type: AccountType;
  name: string;
  balance: number;
  availableBalance: number;
  currency: string;
  interestRate?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  category: string;
  merchant?: string;
  reference: string;
  date: string;
  balance: number;
  counterpartName?: string;
  counterpartIban?: string;
  notes?: string;
  attachments?: string[];
}

export interface AccountsState {
  accounts: Account[];
  selectedAccountId: string | null;
  transactions: Record<string, Transaction[]>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  filters: TransactionFilters;
  searchQuery: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  status?: TransactionStatus;
}

// Card types
export type CardType = 'debit' | 'credit' | 'prepaid';
export type CardStatus = 'active' | 'blocked' | 'expired' | 'pending';
export type CardNetwork = 'visa' | 'mastercard' | 'amex';

export interface Card {
  id: string;
  accountId: string;
  type: CardType;
  network: CardNetwork;
  status: CardStatus;
  cardNumber: string; // masked: **** **** **** 1234
  holderName: string;
  expiryDate: string;
  cvv?: string; // only for display purpose, masked
  creditLimit?: number;
  availableCredit?: number;
  spendingLimit: number;
  dailyLimit: number;
  onlinePaymentEnabled: boolean;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
  isVirtual?: boolean;
  color: string;
  createdAt: string;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  date: string;
  status: TransactionStatus;
  type: 'purchase' | 'refund' | 'withdrawal' | 'fee';
  location?: string;
  isPending: boolean;
}

export interface CardsState {
  cards: Card[];
  selectedCardId: string | null;
  cardTransactions: Record<string, CardTransaction[]>;
  isLoading: boolean;
  error: string | null;
}

// Credit types
export type CreditStatus = 'active' | 'completed' | 'defaulted' | 'pending_approval';
export type CreditType = 'personal' | 'mortgage' | 'auto' | 'business' | 'student';

export interface Credit {
  id: string;
  type: CreditType;
  status: CreditStatus;
  name: string;
  originalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  totalPaid: number;
  currency: string;
  purpose?: string;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  date: string;
}

export interface CreditSimulation {
  amount: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationEntry[];
}

export interface CreditsState {
  credits: Credit[];
  selectedCreditId: string | null;
  simulation: CreditSimulation | null;
  isLoading: boolean;
  error: string | null;
}

// Investment types
export type AssetType = 'stock' | 'etf' | 'bond' | 'fund' | 'savings_plan' | 'crypto';

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  currency: string;
  purchaseDate: string;
  lastUpdated: string;
  sector?: string;
  isin?: string;
  allocation?: number; // percentage of portfolio
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  currency: string;
  lastUpdated: string;
}

export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

export interface InvestmentsState {
  investments: Investment[];
  portfolio: PortfolioSummary | null;
  selectedInvestmentId: string | null;
  priceHistory: Record<string, PricePoint[]>;
  savingsPlans: SavingsPlan[];
  isLoading: boolean;
  error: string | null;
}

export interface SavingsPlan {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  startDate: string;
  targetDate: string;
  interestRate: number;
  currency: string;
  progress: number; // 0-100
}

// Transfer types
export type TransferType = 'internal' | 'external' | 'international' | 'scheduled';

export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bank: string;
  alias?: string;
  isFavorite: boolean;
  lastTransferDate?: string;
  avatar?: string;
}

export interface Transfer {
  id?: string;
  fromAccountId: string;
  toAccountId?: string;
  beneficiaryId?: string;
  recipientIban?: string;
  recipientName?: string;
  amount: number;
  currency: string;
  description: string;
  type: TransferType;
  scheduledDate?: string;
  isRecurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly';
  status?: TransactionStatus;
  reference?: string;
}

// UI State types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Notification {
  id: string;
  type: 'transaction' | 'security' | 'promotion' | 'info';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
}

export interface UIState {
  theme: ThemeMode;
  language: string;
  isOnline: boolean;
  notifications: Notification[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  alertMessage: string | null;
  alertType: 'success' | 'error' | 'warning' | 'info' | null;
  biometricAvailable: boolean;
  notificationsEnabled: boolean;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  TwoFactor: { method: 'sms' | 'email'; maskedContact: string };
  Biometric: undefined;
  PinSetup: undefined;
  PinEntry: { purpose: 'login' | 'transaction' | 'settings' };
};

export type MainTabParamList = {
  HomeTab: undefined;
  AccountsTab: undefined;
  CardsTab: undefined;
  CreditsTab: undefined;
  InvestmentsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  TransferFlow: undefined;
  PaymentFlow: undefined;
  Support: undefined;
};

export type AccountsStackParamList = {
  AccountsList: undefined;
  AccountDetails: { accountId: string };
  TransactionDetails: { transactionId: string; accountId: string };
  TransactionHistory: { accountId: string };
};

export type CardsStackParamList = {
  CardsList: undefined;
  CardDetails: { cardId: string };
  CardSettings: { cardId: string };
  CardTransactions: { cardId: string };
};

export type CreditsStackParamList = {
  CreditsList: undefined;
  CreditDetails: { creditId: string };
  CreditSimulator: undefined;
  CreditRequest: undefined;
};

export type InvestmentsStackParamList = {
  Portfolio: undefined;
  InvestmentDetails: { investmentId: string };
  BuySell: { investmentId?: string; action: 'buy' | 'sell' };
  SavingsPlans: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  SecuritySettings: undefined;
  NotificationSettings: undefined;
  DeviceManagement: undefined;
  Language: undefined;
  About: undefined;
  Support: undefined;
};

// API types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Root state type
export interface RootState {
  auth: AuthState;
  accounts: AccountsState;
  cards: CardsState;
  credits: CreditsState;
  investments: InvestmentsState;
  ui: UIState;
}
