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
};

const es: Translations = {
  welcome: 'Bienvenido',
  welcomeSubtitle: 'Acceda a su área bancaria personal',
  username: 'Nombre de usuario',
  password: 'Contraseña',
  usernamePlaceholder: 'p. ej. josé o francesco',
  passwordPlaceholder: 'Su contraseña',
  rememberMe: 'Recordarme',
  forgotPassword: '¿Olvidó su contraseña?',
  signIn: 'Iniciar sesión',
  biometricAccess: 'Acceso biométrico',
  selectLanguage: 'Seleccionar idioma',
  errorEmptyFields: 'Por favor, introduzca su nombre de usuario y contraseña.',

  goodMorning: 'Buenos días',
  goodAfternoon: 'Buenas tardes',
  goodEvening: 'Buenas noches',
  myAccounts: 'Mis cuentas',
  quickActions: 'Acciones rápidas',
  transfer: 'Transferencia',
  pay: 'Pagar',
  recentTransactions: 'Transacciones recientes',
  seeAll: 'Ver todo',
  markets: 'Mercados',
  noTransactions: 'Sin transacciones',
  noTransactionsMsg: 'Todavía no tiene transacciones.',
  investments: 'Inversiones',

  home: 'Inicio',
  accounts: 'Cuentas',
  cards: 'Tarjetas',
  credits: 'Créditos',
  invest: 'Invertir',
  profile: 'Perfil',

  myProfile: 'Mi Perfil',
  accountSection: 'CUENTA',
  securitySection: 'SEGURIDAD',
  preferencesSection: 'PREFERENCIAS',
  informationSection: 'INFORMACIÓN',
  editProfile: 'Editar perfil',
  changePassword: 'Cambiar contraseña',
  security: 'Seguridad',
  deviceManagement: 'Gestión de dispositivos',
  devicesCount: '2 dispositivos',
  notifications: 'Notificaciones',
  language: 'Idioma',
  appearance: 'Apariencia',
  privacy: 'Privacidad',
  about: 'Acerca de',
  termsOfUse: 'Condiciones de uso',
  customerSupport: 'Soporte al cliente',
  signOut: 'Cerrar sesión',
  logoutConfirm: '¿Está seguro de que desea cerrar sesión en su cuenta BBVA?',
  cancel: 'Cancelar',
  save: 'Guardar',
  dark: 'Oscuro',
  system: 'Sistema',
  light: 'Claro',

  languageHint: 'Elija el idioma de visualización de la aplicación.',
  languageUpdated: 'Idioma actualizado',

  loading: 'Cargando…',
};

const fi: Translations = {
  welcome: 'Tervetuloa',
  welcomeSubtitle: 'Kirjaudu henkilökohtaiseen pankkipalveluusi',
  username: 'Käyttäjänimi',
  password: 'Salasana',
  usernamePlaceholder: 'esim. josé tai francesco',
  passwordPlaceholder: 'Salasanasi',
  rememberMe: 'Muista minut',
  forgotPassword: 'Unohditko salasanasi?',
  signIn: 'Kirjaudu sisään',
  biometricAccess: 'Biometrinen kirjautuminen',
  selectLanguage: 'Valitse kieli',
  errorEmptyFields: 'Syötä käyttäjänimesi ja salasanasi.',

  goodMorning: 'Hyvää huomenta',
  goodAfternoon: 'Hyvää iltapäivää',
  goodEvening: 'Hyvää iltaa',
  myAccounts: 'Omat tilit',
  quickActions: 'Pikavalinnat',
  transfer: 'Siirto',
  pay: 'Maksu',
  recentTransactions: 'Viimeisimmät tapahtumat',
  seeAll: 'Näytä kaikki',
  markets: 'Markkinat',
  noTransactions: 'Ei tapahtumia',
  noTransactionsMsg: 'Sinulla ei vielä ole tapahtumia.',
  investments: 'Sijoitukset',

  home: 'Koti',
  accounts: 'Tilit',
  cards: 'Kortit',
  credits: 'Luotot',
  invest: 'Sijoita',
  profile: 'Profiili',

  myProfile: 'Oma profiili',
  accountSection: 'TILI',
  securitySection: 'TURVALLISUUS',
  preferencesSection: 'ASETUKSET',
  informationSection: 'TIEDOT',
  editProfile: 'Muokkaa profiilia',
  changePassword: 'Vaihda salasana',
  security: 'Turvallisuus',
  deviceManagement: 'Laitteiden hallinta',
  devicesCount: '2 laitetta',
  notifications: 'Ilmoitukset',
  language: 'Kieli',
  appearance: 'Ulkoasu',
  privacy: 'Tietosuoja',
  about: 'Tietoja',
  termsOfUse: 'Käyttöehdot',
  customerSupport: 'Asiakastuki',
  signOut: 'Kirjaudu ulos',
  logoutConfirm: 'Haluatko varmasti kirjautua ulos BBVA-tililtäsi?',
  cancel: 'Peruuta',
  save: 'Tallenna',
  dark: 'Tumma',
  system: 'Järjestelmä',
  light: 'Vaalea',

  languageHint: 'Valitse sovelluksen näyttökieli.',
  languageUpdated: 'Kieli päivitetty',

  loading: 'Ladataan…',
};

const de: Translations = {
  welcome: 'Willkommen',
  welcomeSubtitle: 'Zugang zu Ihrem persönlichen Bankbereich',
  username: 'Benutzername',
  password: 'Passwort',
  usernamePlaceholder: 'z. B. josé oder francesco',
  passwordPlaceholder: 'Ihr Passwort',
  rememberMe: 'Angemeldet bleiben',
  forgotPassword: 'Passwort vergessen?',
  signIn: 'Anmelden',
  biometricAccess: 'Biometrischer Zugang',
  selectLanguage: 'Sprache auswählen',
  errorEmptyFields: 'Bitte geben Sie Ihren Benutzernamen und Ihr Passwort ein.',

  goodMorning: 'Guten Morgen',
  goodAfternoon: 'Guten Tag',
  goodEvening: 'Guten Abend',
  myAccounts: 'Meine Konten',
  quickActions: 'Schnellaktionen',
  transfer: 'Überweisung',
  pay: 'Zahlen',
  recentTransactions: 'Letzte Transaktionen',
  seeAll: 'Alle anzeigen',
  markets: 'Märkte',
  noTransactions: 'Keine Transaktionen',
  noTransactionsMsg: 'Sie haben noch keine Transaktionen.',
  investments: 'Investitionen',

  home: 'Startseite',
  accounts: 'Konten',
  cards: 'Karten',
  credits: 'Kredite',
  invest: 'Investieren',
  profile: 'Profil',

  myProfile: 'Mein Profil',
  accountSection: 'KONTO',
  securitySection: 'SICHERHEIT',
  preferencesSection: 'EINSTELLUNGEN',
  informationSection: 'INFORMATIONEN',
  editProfile: 'Profil bearbeiten',
  changePassword: 'Passwort ändern',
  security: 'Sicherheit',
  deviceManagement: 'Geräteverwaltung',
  devicesCount: '2 Geräte',
  notifications: 'Benachrichtigungen',
  language: 'Sprache',
  appearance: 'Erscheinungsbild',
  privacy: 'Datenschutz',
  about: 'Über uns',
  termsOfUse: 'Nutzungsbedingungen',
  customerSupport: 'Kundendienst',
  signOut: 'Abmelden',
  logoutConfirm: 'Sind Sie sicher, dass Sie sich von Ihrem BBVA-Konto abmelden möchten?',
  cancel: 'Abbrechen',
  save: 'Speichern',
  dark: 'Dunkel',
  system: 'System',
  light: 'Hell',

  languageHint: 'Wählen Sie die Anzeigesprache der Anwendung.',
  languageUpdated: 'Sprache aktualisiert',

  loading: 'Wird geladen…',
};

const no: Translations = {
  welcome: 'Velkommen',
  welcomeSubtitle: 'Få tilgang til ditt personlige bankområde',
  username: 'Brukernavn',
  password: 'Passord',
  usernamePlaceholder: 'f.eks. josé eller francesco',
  passwordPlaceholder: 'Ditt passord',
  rememberMe: 'Husk meg',
  forgotPassword: 'Glemt passordet?',
  signIn: 'Logg inn',
  biometricAccess: 'Biometrisk tilgang',
  selectLanguage: 'Velg språk',
  errorEmptyFields: 'Vennligst skriv inn brukernavnet og passordet ditt.',

  goodMorning: 'God morgen',
  goodAfternoon: 'God ettermiddag',
  goodEvening: 'God kveld',
  myAccounts: 'Mine kontoer',
  quickActions: 'Hurtighandlinger',
  transfer: 'Overføring',
  pay: 'Betal',
  recentTransactions: 'Siste transaksjoner',
  seeAll: 'Se alle',
  markets: 'Markeder',
  noTransactions: 'Ingen transaksjoner',
  noTransactionsMsg: 'Du har ingen transaksjoner ennå.',
  investments: 'Investeringer',

  home: 'Hjem',
  accounts: 'Kontoer',
  cards: 'Kort',
  credits: 'Kreditter',
  invest: 'Invester',
  profile: 'Profil',

  myProfile: 'Min profil',
  accountSection: 'KONTO',
  securitySection: 'SIKKERHET',
  preferencesSection: 'INNSTILLINGER',
  informationSection: 'INFORMASJON',
  editProfile: 'Rediger profil',
  changePassword: 'Endre passord',
  security: 'Sikkerhet',
  deviceManagement: 'Enhetsadministrasjon',
  devicesCount: '2 enheter',
  notifications: 'Varsler',
  language: 'Språk',
  appearance: 'Utseende',
  privacy: 'Personvern',
  about: 'Om oss',
  termsOfUse: 'Vilkår for bruk',
  customerSupport: 'Kundesupport',
  signOut: 'Logg ut',
  logoutConfirm: 'Er du sikker på at du vil logge ut av BBVA-kontoen din?',
  cancel: 'Avbryt',
  save: 'Lagre',
  dark: 'Mørk',
  system: 'System',
  light: 'Lys',

  languageHint: 'Velg visningsspråk for applikasjonen.',
  languageUpdated: 'Språk oppdatert',

  loading: 'Laster…',
};

const it: Translations = {
  welcome: 'Benvenuto',
  welcomeSubtitle: 'Accedi alla tua area bancaria personale',
  username: 'Nome utente',
  password: 'Password',
  usernamePlaceholder: 'es. josé o francesco',
  passwordPlaceholder: 'La tua password',
  rememberMe: 'Ricordami',
  forgotPassword: 'Hai dimenticato la password?',
  signIn: 'Accedi',
  biometricAccess: 'Accesso biometrico',
  selectLanguage: 'Seleziona lingua',
  errorEmptyFields: 'Inserisci il tuo nome utente e la password.',

  goodMorning: 'Buongiorno',
  goodAfternoon: 'Buon pomeriggio',
  goodEvening: 'Buonasera',
  myAccounts: 'I miei conti',
  quickActions: 'Azioni rapide',
  transfer: 'Bonifico',
  pay: 'Paga',
  recentTransactions: 'Transazioni recenti',
  seeAll: 'Vedi tutto',
  markets: 'Mercati',
  noTransactions: 'Nessuna transazione',
  noTransactionsMsg: 'Non hai ancora transazioni.',
  investments: 'Investimenti',

  home: 'Home',
  accounts: 'Conti',
  cards: 'Carte',
  credits: 'Crediti',
  invest: 'Investi',
  profile: 'Profilo',

  myProfile: 'Il mio profilo',
  accountSection: 'ACCOUNT',
  securitySection: 'SICUREZZA',
  preferencesSection: 'PREFERENZE',
  informationSection: 'INFORMAZIONI',
  editProfile: 'Modifica profilo',
  changePassword: 'Cambia password',
  security: 'Sicurezza',
  deviceManagement: 'Gestione dispositivi',
  devicesCount: '2 dispositivi',
  notifications: 'Notifiche',
  language: 'Lingua',
  appearance: 'Aspetto',
  privacy: 'Privacy',
  about: 'Informazioni',
  termsOfUse: "Condizioni d'uso",
  customerSupport: 'Supporto clienti',
  signOut: 'Disconnettersi',
  logoutConfirm: 'Sei sicuro di voler uscire dal tuo account BBVA?',
  cancel: 'Annulla',
  save: 'Salva',
  dark: 'Scuro',
  system: 'Sistema',
  light: 'Chiaro',

  languageHint: "Scegli la lingua di visualizzazione dell'applicazione.",
  languageUpdated: 'Lingua aggiornata',

  loading: 'Caricamento…',
};

const pt: Translations = {
  welcome: 'Bem-vindo',
  welcomeSubtitle: 'Acesse sua área bancária pessoal',
  username: 'Nome de utilizador',
  password: 'Senha',
  usernamePlaceholder: 'ex. josé ou francesco',
  passwordPlaceholder: 'Sua senha',
  rememberMe: 'Lembrar de mim',
  forgotPassword: 'Esqueceu sua senha?',
  signIn: 'Entrar',
  biometricAccess: 'Acesso biométrico',
  selectLanguage: 'Selecionar idioma',
  errorEmptyFields: 'Por favor, insira seu nome de utilizador e senha.',

  goodMorning: 'Bom dia',
  goodAfternoon: 'Boa tarde',
  goodEvening: 'Boa noite',
  myAccounts: 'Minhas contas',
  quickActions: 'Ações rápidas',
  transfer: 'Transferência',
  pay: 'Pagar',
  recentTransactions: 'Transações recentes',
  seeAll: 'Ver tudo',
  markets: 'Mercados',
  noTransactions: 'Sem transações',
  noTransactionsMsg: 'Você ainda não tem transações.',
  investments: 'Investimentos',

  home: 'Início',
  accounts: 'Contas',
  cards: 'Cartões',
  credits: 'Créditos',
  invest: 'Investir',
  profile: 'Perfil',

  myProfile: 'Meu perfil',
  accountSection: 'CONTA',
  securitySection: 'SEGURANÇA',
  preferencesSection: 'PREFERÊNCIAS',
  informationSection: 'INFORMAÇÕES',
  editProfile: 'Editar perfil',
  changePassword: 'Alterar senha',
  security: 'Segurança',
  deviceManagement: 'Gestão de dispositivos',
  devicesCount: '2 dispositivos',
  notifications: 'Notificações',
  language: 'Idioma',
  appearance: 'Aparência',
  privacy: 'Privacidade',
  about: 'Sobre',
  termsOfUse: 'Termos de uso',
  customerSupport: 'Suporte ao cliente',
  signOut: 'Sair',
  logoutConfirm: 'Tem certeza de que deseja sair da sua conta BBVA?',
  cancel: 'Cancelar',
  save: 'Salvar',
  dark: 'Escuro',
  system: 'Sistema',
  light: 'Claro',

  languageHint: 'Escolha o idioma de exibição do aplicativo.',
  languageUpdated: 'Idioma atualizado',

  loading: 'Carregando…',
};

const el: Translations = {
  welcome: 'Καλωσορίσατε',
  welcomeSubtitle: 'Αποκτήστε πρόσβαση στον τραπεζικό σας χώρο',
  username: 'Όνομα χρήστη',
  password: 'Κωδικός πρόσβασης',
  usernamePlaceholder: 'π.χ. josé ή francesco',
  passwordPlaceholder: 'Ο κωδικός σας',
  rememberMe: 'Θυμήσου με',
  forgotPassword: 'Ξεχάσατε τον κωδικό σας;',
  signIn: 'Σύνδεση',
  biometricAccess: 'Βιομετρική πρόσβαση',
  selectLanguage: 'Επιλογή γλώσσας',
  errorEmptyFields: 'Παρακαλώ εισάγετε το όνομα χρήστη και τον κωδικό σας.',

  goodMorning: 'Καλημέρα',
  goodAfternoon: 'Καλό απόγευμα',
  goodEvening: 'Καλησπέρα',
  myAccounts: 'Οι λογαριασμοί μου',
  quickActions: 'Γρήγορες ενέργειες',
  transfer: 'Μεταφορά',
  pay: 'Πληρωμή',
  recentTransactions: 'Πρόσφατες συναλλαγές',
  seeAll: 'Δείτε όλα',
  markets: 'Αγορές',
  noTransactions: 'Δεν υπάρχουν συναλλαγές',
  noTransactionsMsg: 'Δεν έχετε ακόμα συναλλαγές.',
  investments: 'Επενδύσεις',

  home: 'Αρχική',
  accounts: 'Λογαριασμοί',
  cards: 'Κάρτες',
  credits: 'Πίστωση',
  invest: 'Επενδύσεις',
  profile: 'Προφίλ',

  myProfile: 'Το προφίλ μου',
  accountSection: 'ΛΟΓΑΡΙΑΣΜΟΣ',
  securitySection: 'ΑΣΦΑΛΕΙΑ',
  preferencesSection: 'ΠΡΟΤΙΜΗΣΕΙΣ',
  informationSection: 'ΠΛΗΡΟΦΟΡΙΕΣ',
  editProfile: 'Επεξεργασία προφίλ',
  changePassword: 'Αλλαγή κωδικού',
  security: 'Ασφάλεια',
  deviceManagement: 'Διαχείριση συσκευών',
  devicesCount: '2 συσκευές',
  notifications: 'Ειδοποιήσεις',
  language: 'Γλώσσα',
  appearance: 'Εμφάνιση',
  privacy: 'Απόρρητο',
  about: 'Σχετικά',
  termsOfUse: 'Όροι χρήσης',
  customerSupport: 'Εξυπηρέτηση πελατών',
  signOut: 'Αποσύνδεση',
  logoutConfirm: 'Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε από τον λογαριασμό BBVA;',
  cancel: 'Ακύρωση',
  save: 'Αποθήκευση',
  dark: 'Σκοτεινό',
  system: 'Σύστημα',
  light: 'Φωτεινό',

  languageHint: 'Επιλέξτε τη γλώσσα εμφάνισης της εφαρμογής.',
  languageUpdated: 'Η γλώσσα ενημερώθηκε',

  loading: 'Φόρτωση…',
};

const sk: Translations = {
  welcome: 'Vitajte',
  welcomeSubtitle: 'Prístup do vašej osobnej bankovej oblasti',
  username: 'Používateľské meno',
  password: 'Heslo',
  usernamePlaceholder: 'napr. josé alebo francesco',
  passwordPlaceholder: 'Vaše heslo',
  rememberMe: 'Zapamätaj si ma',
  forgotPassword: 'Zabudli ste heslo?',
  signIn: 'Prihlásiť sa',
  biometricAccess: 'Biometrický prístup',
  selectLanguage: 'Vybrať jazyk',
  errorEmptyFields: 'Zadajte prosím svoje používateľské meno a heslo.',

  goodMorning: 'Dobré ráno',
  goodAfternoon: 'Dobrý deň',
  goodEvening: 'Dobrý večer',
  myAccounts: 'Moje účty',
  quickActions: 'Rýchle akcie',
  transfer: 'Prevod',
  pay: 'Platiť',
  recentTransactions: 'Posledné transakcie',
  seeAll: 'Zobraziť všetko',
  markets: 'Trhy',
  noTransactions: 'Žiadne transakcie',
  noTransactionsMsg: 'Zatiaľ nemáte žiadne transakcie.',
  investments: 'Investície',

  home: 'Domov',
  accounts: 'Účty',
  cards: 'Karty',
  credits: 'Kredity',
  invest: 'Investovať',
  profile: 'Profil',

  myProfile: 'Môj profil',
  accountSection: 'ÚČET',
  securitySection: 'BEZPEČNOSŤ',
  preferencesSection: 'PREDVOĽBY',
  informationSection: 'INFORMÁCIE',
  editProfile: 'Upraviť profil',
  changePassword: 'Zmeniť heslo',
  security: 'Bezpečnosť',
  deviceManagement: 'Správa zariadení',
  devicesCount: '2 zariadenia',
  notifications: 'Oznámenia',
  language: 'Jazyk',
  appearance: 'Vzhľad',
  privacy: 'Súkromie',
  about: 'O aplikácii',
  termsOfUse: 'Podmienky používania',
  customerSupport: 'Zákaznícka podpora',
  signOut: 'Odhlásiť sa',
  logoutConfirm: 'Ste si istí, že sa chcete odhlásiť z vášho účtu BBVA?',
  cancel: 'Zrušiť',
  save: 'Uložiť',
  dark: 'Tmavý',
  system: 'Systém',
  light: 'Svetlý',

  languageHint: 'Vyberte jazyk zobrazenia aplikácie.',
  languageUpdated: 'Jazyk aktualizovaný',

  loading: 'Načítava sa…',
};

export const TRANSLATIONS: Record<string, Translations> = {
  en,
  es,
  fi,
  de,
  no,
  it,
  pt,
  el,
  sk,
};
