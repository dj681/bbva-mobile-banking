// Reducers
export { default as authReducer } from './authSlice';
export { default as accountsReducer } from './accountsSlice';
export { default as cardsReducer } from './cardsSlice';
export { default as creditsReducer } from './creditsSlice';
export { default as investmentsReducer } from './investmentsSlice';
export { default as uiReducer } from './uiSlice';

// Auth actions & thunks
export {
  setUser,
  setToken,
  setRefreshToken,
  logout,
  setLoading as setAuthLoading,
  setError as setAuthError,
  enableBiometric,
  disableBiometric,
  setPin,
  clearPin,
  setSessionExpiry,
  setTwoFactorPending,
  loginUser,
  verifyTwoFactor,
  biometricLogin,
  logoutUser,
} from './authSlice';

// Accounts actions & thunks
export {
  setAccounts,
  setSelectedAccount,
  setTransactions,
  setLoading as setAccountsLoading,
  setError as setAccountsError,
  setFilters,
  setSearchQuery,
  clearFilters,
  addTransaction,
  fetchAccounts,
  fetchTransactions,
  fetchAccountDetails,
} from './accountsSlice';

// Cards actions & thunks
export {
  setCards,
  setSelectedCard,
  setCardTransactions,
  setLoading as setCardsLoading,
  setError as setCardsError,
  updateCard,
  fetchCards,
  fetchCardTransactions,
  blockCard,
  unblockCard,
  updateCardLimits,
} from './cardsSlice';

// Credits actions & thunks
export {
  setCredits,
  setSelectedCredit,
  setSimulation,
  setLoading as setCreditsLoading,
  setError as setCreditsError,
  fetchCredits,
  fetchCreditDetails,
  simulateCredit,
  requestCredit,
  makeEarlyPayment,
} from './creditsSlice';

// Investments actions & thunks
export {
  setInvestments,
  setPortfolio,
  setSelectedInvestment,
  setPriceHistory,
  setSavingsPlans,
  setLoading as setInvestmentsLoading,
  setError as setInvestmentsError,
  fetchPortfolio,
  fetchInvestmentDetails,
  fetchPriceHistory,
  buyInvestment,
  sellInvestment,
} from './investmentsSlice';

// UI actions
export {
  setTheme,
  setLanguage,
  setOnlineStatus,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  setLoading as setUILoading,
  showAlert,
  hideAlert,
  setBiometricAvailable,
  setNotificationsEnabled,
} from './uiSlice';
