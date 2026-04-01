export type Translations = {
  // Auth
  welcome: string;
  welcomeSubtitle: string;
  username: string;
  password: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  signIn: string;
  biometricAccess: string;
  selectLanguage: string;
  errorEmptyFields: string;

  // Dashboard / navigation
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  myAccounts: string;
  quickActions: string;
  transfer: string;
  pay: string;
  recentTransactions: string;
  seeAll: string;
  markets: string;
  noTransactions: string;
  noTransactionsMsg: string;
  investments: string;

  // Tab labels
  home: string;
  accounts: string;
  cards: string;
  credits: string;
  invest: string;
  profile: string;

  // Profile
  myProfile: string;
  accountSection: string;
  securitySection: string;
  preferencesSection: string;
  informationSection: string;
  editProfile: string;
  changePassword: string;
  security: string;
  deviceManagement: string;
  devicesCount: string;
  notifications: string;
  language: string;
  appearance: string;
  privacy: string;
  about: string;
  termsOfUse: string;
  customerSupport: string;
  signOut: string;
  logoutConfirm: string;
  cancel: string;
  save: string;
  dark: string;
  system: string;
  light: string;

  // Language screen
  languageHint: string;
  languageUpdated: string;

  // Common
  loading: string;

  // Accounts
  accountTypeChecking: string;
  accountTypeSavings: string;
  accountTypeInvestment: string;
  accountTypeCredit: string;
  accountTypeCheckingFull: string;
  accountTypeSavingsFull: string;
  accountTypeInvestmentFull: string;
  accountTypeCreditFull: string;
  defaultAccount: string;
  noAccounts: string;
  noAccountsMsg: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  openingDate: string;
  interestRate: string;
  totalBalance: string;
  availableBalance: string;
  heldBalance: string;
  statement: string;
  searchTransaction: string;
  accountNotFound: string;
  accountNotFoundMsg: string;
  noTransactionsForAccount: string;
  tabTransactions: string;
  tabAccountInfo: string;
  myAccounts2: string;

  // Cards
  myCards: string;
  noCards: string;
  noCardsMsg: string;
  cardStatusActive: string;
  cardStatusBlocked: string;
  cardStatusExpired: string;
  cardStatusPending: string;
  cardNumber: string;
  cardExpiry: string;
  cardVirtual: string;
  cardPhysical: string;
  creditLimit: string;
  dailyLimit: string;
  cardBlock: string;
  cardUnblock: string;
  cardLimits: string;
  cardMoves: string;
  latestOperations: string;
  pendingStatus: string;
  seeAllMovements: string;

  // Credits
  myCredits: string;
  creditTypeMortgage: string;
  creditTypeAuto: string;
  creditTypePersonal: string;
  creditTypeBusiness: string;
  creditTypeStudent: string;
  creditStatusClosed: string;
  creditStatusActive: string;
  creditSummaryTitle: string;
  totalPendingBalance: string;
  nextDueDate: string;
  installment: string;
  nextPayment: string;
  noCredits: string;
  noCreditsMsg: string;
  simulateCredit: string;
  requestCredit: string;

  // Transactions
  transactionNotFound: string;
  txStatusCompleted: string;
  txStatusPending: string;
  txStatusFailed: string;
  txStatusCancelled: string;
  txDateTime: string;
  txTypeLabel: string;
  txTypeCredit: string;
  txTypeDebit: string;
  txTypeTransfer: string;
  txTypePayment: string;
  category: string;
  reference: string;
  txDescription: string;
  sender: string;
  recipient: string;
  counterpartIban: string;
  notes: string;
  addNote: string;
  noNotes: string;
  shareExport: string;
  filterAll: string;
  filterCredits: string;
  filterDebits: string;
  filterTransfers: string;
  search: string;
  exportLabel: string;
  exportTransactions: string;
  exportIn: string;

  // Transfers
  myAccountsTab: string;
  beneficiaries: string;
  newTransfer: string;
  executionDate: string;

  // Card Details
  back: string;
  cardDetailsTitle: string;
  information: string;
  cardHolder: string;
  cardStatus: string;
  cardType: string;

  // Profile / misc
  invalidPhoneNumber: string;
  availableCredit: string;
  firstNameRequired: string;
  lastNameRequired: string;
  postalCodeInvalid: string;
  cityInvalid: string;
  emailReadonly: string;
  labelFirstName: string;
  labelLastName: string;
  labelEmail: string;
  labelPhone: string;
  labelBirthDate: string;
  labelAddress: string;
  labelPostalCode: string;
  labelCity: string;
  labelAddressSection: string;
  birthDatePlaceholder: string;
  profilePhotoTitle: string;
  profilePhotoMsg: string;
  accountsCountUnit: string;
};

const en: Translations = {
  welcome: 'Welcome',
  welcomeSubtitle: 'Access your personal banking area',
  username: 'Username',
  password: 'Password',
  usernamePlaceholder: 'e.g. josé or francesco',
  passwordPlaceholder: 'Your password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot your password?',
  signIn: 'Sign in',
  biometricAccess: 'Biometric access',
  selectLanguage: 'Select Language',
  errorEmptyFields: 'Please enter your username and password.',

  goodMorning: 'Good morning',
  goodAfternoon: 'Good afternoon',
  goodEvening: 'Good evening',
  myAccounts: 'My accounts',
  quickActions: 'Quick actions',
  transfer: 'Transfer',
  pay: 'Pay',
  recentTransactions: 'Recent transactions',
  seeAll: 'See all',
  markets: 'Markets',
  noTransactions: 'No transactions',
  noTransactionsMsg: 'You have no transactions yet.',
  investments: 'Investments',

  home: 'Home',
  accounts: 'Accounts',
  cards: 'Cards',
  credits: 'Credits',
  invest: 'Invest',
  profile: 'Profile',

  myProfile: 'My Profile',
  accountSection: 'ACCOUNT',
  securitySection: 'SECURITY',
  preferencesSection: 'PREFERENCES',
  informationSection: 'INFORMATION',
  editProfile: 'Edit profile',
  changePassword: 'Change password',
  security: 'Security',
  deviceManagement: 'Device management',
  devicesCount: '2 devices',
  notifications: 'Notifications',
  language: 'Language',
  appearance: 'Appearance',
  privacy: 'Privacy',
  about: 'About',
  termsOfUse: 'Terms of use',
  customerSupport: 'Customer support',
  signOut: 'Sign out',
  logoutConfirm: 'Are you sure you want to sign out of your BBVA account?',
  cancel: 'Cancel',
  save: 'Save',
  dark: 'Dark',
  system: 'System',
  light: 'Light',

  languageHint: 'Choose the display language of the application.',
  languageUpdated: 'Language updated',

  loading: 'Loading…',

  accountTypeChecking: 'Checking',
  accountTypeSavings: 'Savings',
  accountTypeInvestment: 'Investment',
  accountTypeCredit: 'Credit',
  accountTypeCheckingFull: 'Checking account',
  accountTypeSavingsFull: 'Savings account',
  accountTypeInvestmentFull: 'Investment account',
  accountTypeCreditFull: 'Credit account',
  defaultAccount: 'Default',
  noAccounts: 'No accounts',
  noAccountsMsg: 'You have no bank accounts yet.',
  accountHolder: 'Holder',
  accountNumber: 'Account number',
  accountType: 'Account type',
  currency: 'Currency',
  openingDate: 'Opening date',
  interestRate: 'Interest rate',
  totalBalance: 'Total balance',
  availableBalance: 'Available',
  heldBalance: 'Held',
  statement: 'Statement',
  searchTransaction: 'Search a transaction...',
  accountNotFound: 'Account not found',
  accountNotFoundMsg: 'This account does not exist or has been deleted.',
  noTransactionsForAccount: 'No transactions found.',
  tabTransactions: 'Transactions',
  tabAccountInfo: 'Account information',
  myAccounts2: 'My Accounts',

  myCards: 'My Cards',
  noCards: 'No cards',
  noCardsMsg: 'You have no bank cards yet.',
  cardStatusActive: 'Active',
  cardStatusBlocked: 'Blocked',
  cardStatusExpired: 'Expired',
  cardStatusPending: 'Pending',
  cardNumber: 'Number',
  cardExpiry: 'Expiry',
  cardVirtual: 'Virtual card',
  cardPhysical: 'Physical card',
  creditLimit: 'Credit limit',
  dailyLimit: 'Daily limit',
  cardBlock: 'Block',
  cardUnblock: 'Unblock',
  cardLimits: 'Limits',
  cardMoves: 'Movements',
  latestOperations: 'Latest operations',
  pendingStatus: 'Pending',
  seeAllMovements: 'See all movements',

  myCredits: 'My Credits',
  creditTypeMortgage: 'Mortgage',
  creditTypeAuto: 'Auto',
  creditTypePersonal: 'Personal',
  creditTypeBusiness: 'Business',
  creditTypeStudent: 'Student',
  creditStatusClosed: 'Settled',
  creditStatusActive: 'Active',
  creditSummaryTitle: 'My credits summary',
  totalPendingBalance: 'Total pending balance',
  nextDueDate: 'Next due date',
  installment: 'Installment',
  nextPayment: 'Next',
  noCredits: 'No credits',
  noCreditsMsg: 'You have no active credits.',
  simulateCredit: '🧮 Simulate credit',
  requestCredit: '📄 Request a credit',

  transactionNotFound: 'Transaction not found',
  txStatusCompleted: 'Completed',
  txStatusPending: 'Pending',
  txStatusFailed: 'Failed',
  txStatusCancelled: 'Cancelled',
  txDateTime: 'Date and time',
  txTypeLabel: 'Type',
  txTypeCredit: 'Credit',
  txTypeDebit: 'Debit',
  txTypeTransfer: 'Transfer',
  txTypePayment: 'Payment',
  category: 'Category',
  reference: 'Reference',
  txDescription: 'Description',
  sender: 'Sender',
  recipient: 'Recipient',
  counterpartIban: 'Counterpart IBAN',
  notes: 'Notes',
  addNote: 'Add a note...',
  noNotes: 'No notes. Tap the pencil to add one.',
  shareExport: 'Share / Export',
  filterAll: 'All',
  filterCredits: 'Credits',
  filterDebits: 'Debits',
  filterTransfers: 'Transfers',
  search: 'Search...',
  exportLabel: 'Export',
  exportTransactions: 'Export transactions',
  exportIn: 'Export as',

  myAccountsTab: 'My accounts',
  beneficiaries: 'Beneficiaries',
  newTransfer: 'New',
  executionDate: 'Execution date (YYYY-MM-DD)',

  back: 'Back',
  cardDetailsTitle: 'Card details',
  information: 'Information',
  cardHolder: 'Cardholder',
  cardStatus: 'Status',
  cardType: 'Type',

  invalidPhoneNumber: 'Invalid phone number',
  availableCredit: 'Available credit',
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  postalCodeInvalid: 'Invalid postal code (5 digits)',
  cityInvalid: 'Invalid city',
  emailReadonly: 'The email address cannot be changed here. Contact support.',
  labelFirstName: 'First name',
  labelLastName: 'Last name',
  labelEmail: 'Email address',
  labelPhone: 'Phone number',
  labelBirthDate: 'Date of birth',
  labelAddress: 'Address',
  labelPostalCode: 'Postal code',
  labelCity: 'City',
  labelAddressSection: 'ADDRESS',
  birthDatePlaceholder: 'DD/MM/YYYY',
  profilePhotoTitle: 'Profile photo',
  profilePhotoMsg: 'Feature coming soon',
  accountsCountUnit: 'accounts',
};

const tr: Translations = {
  welcome: 'Hoş geldiniz',
  welcomeSubtitle: 'Kişisel bankacılık alanınıza erişin',
  username: 'Kullanıcı adı',
  password: 'Şifre',
  usernamePlaceholder: 'örn. josé veya francesco',
  passwordPlaceholder: 'Şifreniz',
  rememberMe: 'Beni hatırla',
  forgotPassword: 'Şifremi unuttum?',
  signIn: 'Giriş yap',
  biometricAccess: 'Biyometrik erişim',
  selectLanguage: 'Dil seçin',
  errorEmptyFields: 'Lütfen kullanıcı adınızı ve şifrenizi girin.',

  goodMorning: 'Günaydın',
  goodAfternoon: 'İyi öğleden sonralar',
  goodEvening: 'İyi akşamlar',
  myAccounts: 'Hesaplarım',
  quickActions: 'Hızlı işlemler',
  transfer: 'Transfer',
  pay: 'Öde',
  recentTransactions: 'Son işlemler',
  seeAll: 'Tümünü gör',
  markets: 'Piyasalar',
  noTransactions: 'İşlem yok',
  noTransactionsMsg: 'Henüz hiç işleminiz yok.',
  investments: 'Yatırımlar',

  home: 'Ana sayfa',
  accounts: 'Hesaplar',
  cards: 'Kartlar',
  credits: 'Krediler',
  invest: 'Yatır',
  profile: 'Profil',

  myProfile: 'Profilim',
  accountSection: 'HESAP',
  securitySection: 'GÜVENLİK',
  preferencesSection: 'TERCİHLER',
  informationSection: 'BİLGİ',
  editProfile: 'Profili düzenle',
  changePassword: 'Şifreyi değiştir',
  security: 'Güvenlik',
  deviceManagement: 'Cihaz yönetimi',
  devicesCount: '2 cihaz',
  notifications: 'Bildirimler',
  language: 'Dil',
  appearance: 'Görünüm',
  privacy: 'Gizlilik',
  about: 'Hakkında',
  termsOfUse: 'Kullanım koşulları',
  customerSupport: 'Müşteri desteği',
  signOut: 'Çıkış yap',
  logoutConfirm: 'BBVA hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
  cancel: 'İptal',
  save: 'Kaydet',
  dark: 'Koyu',
  system: 'Sistem',
  light: 'Açık',

  languageHint: 'Uygulamanın görüntüleme dilini seçin.',
  languageUpdated: 'Dil güncellendi',

  loading: 'Yükleniyor…',

  accountTypeChecking: 'Vadesiz',
  accountTypeSavings: 'Birikim',
  accountTypeInvestment: 'Yatırım',
  accountTypeCredit: 'Kredi',
  accountTypeCheckingFull: 'Vadesiz hesap',
  accountTypeSavingsFull: 'Birikim hesabı',
  accountTypeInvestmentFull: 'Yatırım hesabı',
  accountTypeCreditFull: 'Kredi hesabı',
  defaultAccount: 'Varsayılan',
  noAccounts: 'Hesap yok',
  noAccountsMsg: 'Henüz banka hesabınız yok.',
  accountHolder: 'Hesap sahibi',
  accountNumber: 'Hesap numarası',
  accountType: 'Hesap türü',
  currency: 'Para birimi',
  openingDate: 'Açılış tarihi',
  interestRate: 'Faiz oranı',
  totalBalance: 'Toplam bakiye',
  availableBalance: 'Kullanılabilir',
  heldBalance: 'Beklemede',
  statement: 'Ekstre',
  searchTransaction: 'İşlem ara...',
  accountNotFound: 'Hesap bulunamadı',
  accountNotFoundMsg: 'Bu hesap mevcut değil veya silinmiş.',
  noTransactionsForAccount: 'İşlem bulunamadı.',
  tabTransactions: 'İşlemler',
  tabAccountInfo: 'Hesap bilgileri',
  myAccounts2: 'Hesaplarım',

  myCards: 'Kartlarım',
  noCards: 'Kart yok',
  noCardsMsg: 'Henüz banka kartınız yok.',
  cardStatusActive: 'Aktif',
  cardStatusBlocked: 'Bloke',
  cardStatusExpired: 'Süresi dolmuş',
  cardStatusPending: 'Beklemede',
  cardNumber: 'Numara',
  cardExpiry: 'Son kullanma',
  cardVirtual: 'Sanal kart',
  cardPhysical: 'Fiziksel kart',
  creditLimit: 'Kredi limiti',
  dailyLimit: 'Günlük limit',
  cardBlock: 'Bloke et',
  cardUnblock: 'Bloke kaldır',
  cardLimits: 'Limitler',
  cardMoves: 'Hareketler',
  latestOperations: 'Son işlemler',
  pendingStatus: 'Beklemede',
  seeAllMovements: 'Tüm hareketleri gör',

  myCredits: 'Kredilerim',
  creditTypeMortgage: 'Konut',
  creditTypeAuto: 'Araç',
  creditTypePersonal: 'Bireysel',
  creditTypeBusiness: 'İşletme',
  creditTypeStudent: 'Öğrenci',
  creditStatusClosed: 'Kapandı',
  creditStatusActive: 'Aktif',
  creditSummaryTitle: 'Kredi özetim',
  totalPendingBalance: 'Toplam bekleyen bakiye',
  nextDueDate: 'Sonraki vade tarihi',
  installment: 'Taksit',
  nextPayment: 'Sonraki',
  noCredits: 'Kredi yok',
  noCreditsMsg: 'Aktif krediniz yok.',
  simulateCredit: '🧮 Kredi simülasyonu',
  requestCredit: '📄 Kredi talebi',

  transactionNotFound: 'İşlem bulunamadı',
  txStatusCompleted: 'Tamamlandı',
  txStatusPending: 'Beklemede',
  txStatusFailed: 'Başarısız',
  txStatusCancelled: 'İptal edildi',
  txDateTime: 'Tarih ve saat',
  txTypeLabel: 'Tür',
  txTypeCredit: 'Alacak',
  txTypeDebit: 'Borç',
  txTypeTransfer: 'Transfer',
  txTypePayment: 'Ödeme',
  category: 'Kategori',
  reference: 'Referans',
  txDescription: 'Açıklama',
  sender: 'Gönderen',
  recipient: 'Alıcı',
  counterpartIban: 'Karşı taraf IBAN',
  notes: 'Notlar',
  addNote: 'Not ekle...',
  noNotes: 'Not yok. Eklemek için kaleme dokunun.',
  shareExport: 'Paylaş / Dışa aktar',
  filterAll: 'Tümü',
  filterCredits: 'Alacaklar',
  filterDebits: 'Borçlar',
  filterTransfers: 'Transferler',
  search: 'Ara...',
  exportLabel: 'Dışa aktar',
  exportTransactions: 'İşlemleri dışa aktar',
  exportIn: 'Şu biçimde dışa aktar',

  myAccountsTab: 'Hesaplarım',
  beneficiaries: 'Alıcılar',
  newTransfer: 'Yeni',
  executionDate: 'Yürütme tarihi (YYYY-MM-DD)',

  back: 'Geri',
  cardDetailsTitle: 'Kart detayları',
  information: 'Bilgi',
  cardHolder: 'Kart sahibi',
  cardStatus: 'Durum',
  cardType: 'Tür',

  invalidPhoneNumber: 'Geçersiz telefon numarası',
  availableCredit: 'Kullanılabilir kredi',
  firstNameRequired: 'Ad zorunludur',
  lastNameRequired: 'Soyad zorunludur',
  postalCodeInvalid: 'Geçersiz posta kodu (5 rakam)',
  cityInvalid: 'Geçersiz şehir',
  emailReadonly: 'E-posta adresi burada değiştirilemez. Destekle iletişime geçin.',
  labelFirstName: 'Ad',
  labelLastName: 'Soyad',
  labelEmail: 'E-posta adresi',
  labelPhone: 'Telefon numarası',
  labelBirthDate: 'Doğum tarihi',
  labelAddress: 'Adres',
  labelPostalCode: 'Posta kodu',
  labelCity: 'Şehir',
  labelAddressSection: 'ADRES',
  birthDatePlaceholder: 'GG/AA/YYYY',
  profilePhotoTitle: 'Profil fotoğrafı',
  profilePhotoMsg: 'Özellik çok yakında',
  accountsCountUnit: 'hesap',
};

export const TRANSLATIONS: Record<string, Translations> = {
  en,
  tr,
};
