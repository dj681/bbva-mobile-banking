# BBVA Mobile Banking 📱

Application bancaire mobile complète développée avec React Native et Expo, reproduisant les fonctionnalités essentielles d'une banque numérique moderne pour la clientèle BBVA.

---

## 🚀 Démarrage Rapide

> **Temps estimé : 3 minutes** — Suivez ces étapes pour lancer l'application localement.

### Prérequis rapides

| Outil | Version | Vérification |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| [Expo Go](https://expo.dev/go) | dernière | App Store / Play Store |

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/dj681/bbva-mobile-banking.git
cd bbva-mobile-banking

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur de développement
npm start
```

Un **QR code** s'affiche dans le terminal.

| Plateforme | Comment ouvrir l'application |
|---|---|
| 📱 Appareil physique | Scannez le QR code avec **Expo Go** (iOS/Android) |
| 🤖 Émulateur Android | `npm run android` — ou appuyez sur **`a`** dans le terminal |
| 🍎 Simulateur iOS | `npm run ios` — ou appuyez sur **`i`** *(macOS uniquement)* |
| 🌐 Navigateur web | `npm run web` — ou appuyez sur **`w`** dans le terminal |

### Connexion en mode démonstration

> L'application utilise uniquement des données fictives. Aucun compte réel n'est requis.

Entrez **n'importe quel e-mail et mot de passe** sur l'écran de connexion.  
Exemple : `demo@bbva.fr` / `demo1234`

---

## �� Stack Technologique

| Technologie | Version | Usage |
|---|---|---|
| React Native | 0.76+ | Framework mobile cross-platform |
| Expo | SDK 52 | Outillage et build simplifié |
| TypeScript | 5.x | Typage statique |
| Redux Toolkit | 2.x | Gestion d'état global |
| React Navigation | v6 | Navigation entre écrans |
| React Native Reanimated | 3.x | Animations fluides |
| Expo Linear Gradient | - | Dégradés visuels |
| Expo Blur | - | Effets de flou |

## ✨ Fonctionnalités

### 🏦 Comptes Bancaires
- Consultation du solde en temps réel
- Historique détaillé des transactions
- Filtrage et recherche dans les transactions
- Détails complets de chaque opération

### 💳 Cartes Bancaires
- Gestion des cartes de débit et crédit
- Activation / désactivation de carte
- Suivi des transactions par carte
- Paramètres de sécurité

### 💸 Virements & Paiements
- Virements nationaux et internationaux
- Paiement de factures
- Gestion des bénéficiaires
- Suivi du statut des opérations

### 📈 Investissements
- Portefeuille d'investissements
- Achat et vente d'actifs
- Plans d'épargne
- Performance et rendements

### 💰 Crédits
- Liste des crédits en cours
- Détails et échéancier
- Simulateur de crédit
- Demande de nouveau crédit

### 👤 Profil & Paramètres
- Gestion du profil utilisateur
- Sécurité et authentification biométrique
- Préférences de notifications
- Langue et accessibilité
- Support client

## 📱 Écrans

### Authentification
- **LoginScreen** — Connexion par identifiants
- **TwoFactorScreen** — Vérification en deux étapes
- **BiometricScreen** — Authentification biométrique (Face ID / Touch ID)
- **PinScreen** — Configuration et saisie du code PIN

### Tableau de bord
- **DashboardScreen** — Vue d'ensemble des comptes et accès rapide
- **NotificationsScreen** — Centre de notifications

### Comptes
- **AccountsListScreen** — Liste de tous les comptes
- **AccountDetailsScreen** — Détails d'un compte
- **TransactionHistoryScreen** — Historique des transactions
- **TransactionDetailsScreen** — Détail d'une transaction

### Cartes
- **CardsListScreen** — Liste des cartes bancaires
- **CardDetailsScreen** — Détails et gestion d'une carte
- **CardTransactionsScreen** — Transactions d'une carte

### Virements
- **TransferScreen** — Formulaire de virement
- **PaymentScreen** — Paiement de facture

### Investissements
- **PortfolioScreen** — Portefeuille d'investissements
- **InvestmentDetailsScreen** — Détails d'un investissement
- **BuySellScreen** — Achat / Vente d'actifs
- **SavingsPlansScreen** — Plans d'épargne

### Crédits
- **CreditsListScreen** — Liste des crédits
- **CreditDetailsScreen** — Détails d'un crédit
- **CreditSimulatorScreen** — Simulateur de crédit
- **CreditRequestScreen** — Demande de crédit

### Profil
- **ProfileHomeScreen** — Page principale du profil
- **EditProfileScreen** — Modification du profil
- **ChangePasswordScreen** — Changement de mot de passe
- **SecuritySettingsScreen** — Paramètres de sécurité
- **NotificationSettingsScreen** — Paramètres de notifications
- **LanguageScreen** — Préférences de langue
- **AboutScreen** — À propos de l'application
- **SupportScreen** — Support client

## 🔧 Prérequis

- **Node.js** 18 ou supérieur
- **npm** 9+ ou **yarn** 1.22+
- **Expo CLI** : `npm install -g expo-cli`
- **Expo Go** sur iOS ou Android (pour le développement)
- **Android Studio** (pour l'émulateur Android, optionnel)
- **Xcode** (pour le simulateur iOS, macOS uniquement, optionnel)

## ⚙️ Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/dj681/bbva-mobile-banking.git
cd bbva-mobile-banking

# 2. Installer les dépendances
npm install
```

## ▶️ Lancer l'application

```bash
# Démarrer le serveur de développement Expo
npx expo start

# Ouvrir sur Android
npx expo start --android

# Ouvrir sur iOS
npx expo start --ios

# Ouvrir dans le navigateur web
npx expo start --web
```

Scannez le QR code avec l'application **Expo Go** sur votre appareil mobile.

## 🗂️ Structure du Projet

```
bbva-mobile-banking/
├── App.tsx                          # Point d'entrée de l'application
├── app.json                         # Configuration Expo
├── babel.config.js                  # Configuration Babel
├── tsconfig.json                    # Configuration TypeScript
├── package.json
└── src/
    ├── components/                  # Composants réutilisables
    │   ├── common/                  # Composants génériques (Button, Input…)
    │   └── banking/                 # Composants spécifiques bancaires
    ├── navigation/                  # Navigateurs React Navigation
    │   ├── RootNavigator.tsx        # Navigateur racine
    │   ├── AuthNavigator.tsx        # Navigation d'authentification
    │   ├── MainNavigator.tsx        # Navigation principale (tabs)
    │   ├── HomeStackNavigator.tsx   # Stack du tableau de bord
    │   ├── AccountsStackNavigator.tsx
    │   ├── CardsStackNavigator.tsx
    │   ├── InvestmentsStackNavigator.tsx
    │   └── ProfileStackNavigator.tsx
    ├── screens/                     # Écrans de l'application
    │   ├── auth/                    # Authentification
    │   ├── home/                    # Tableau de bord
    │   ├── accounts/                # Comptes bancaires
    │   ├── cards/                   # Cartes bancaires
    │   ├── transfers/               # Virements
    │   ├── credits/                 # Crédits
    │   ├── investments/             # Investissements
    │   └── profile/                 # Profil utilisateur
    ├── store/                       # Redux store
    │   ├── index.ts                 # Configuration du store
    │   └── slices/                  # Slices Redux (auth, accounts, cards…)
    ├── hooks/                       # Hooks personnalisés
    ├── services/                    # Services API (mock)
    ├── types/                       # Types TypeScript
    ├── constants/                   # Constantes (couleurs, thème…)
    └── utils/                       # Fonctions utilitaires
```

## 🎨 Système de Design

### Palette de Couleurs BBVA

| Couleur | Valeur Hex | Usage |
|---|---|---|
| BBVA Bleu Primaire | `#004481` | Couleur principale, en-têtes |
| BBVA Bleu Foncé | `#002A6E` | Dégradés, éléments accentués |
| BBVA Bleu Clair | `#1464A0` | Éléments interactifs |
| Aqua BBVA | `#2DCCCD` | Indicateurs, succès |
| Blanc | `#FFFFFF` | Fond, texte sur fond sombre |
| Gris Clair | `#F5F5F5` | Fond secondaire |
| Texte Principal | `#1A1A2E` | Texte général |
| Texte Secondaire | `#666680` | Sous-titres, labels |

### Typographie
- Police principale : **SF Pro Display** (iOS) / **Roboto** (Android)
- Taille de base : 16px
- Hiérarchie typographique cohérente (h1 → caption)

## 🔐 Sécurité

- **Authentification biométrique** : Face ID et Touch ID via `expo-local-authentication`
- **Code PIN** : Code à 6 chiffres avec verrouillage après tentatives échouées
- **Authentification à deux facteurs** (2FA) par SMS ou application
- **Chiffrement des données** locales sensibles
- **Session sécurisée** avec timeout automatique
- **Masquage des données** : numéros de carte et IBAN masqués par défaut

## 📊 Données de Démonstration

> ⚠️ **Important** : Cette application utilise exclusivement des **données fictives** à des fins de démonstration. Aucune connexion à un serveur BBVA réel n'est établie. Toutes les transactions, soldes et informations personnelles affichés sont générés aléatoirement et ne correspondent à aucun compte réel.

## 🤝 Contribution

Les contributions sont les bienvenues ! Suivez ces étapes :

1. Forkez le dépôt
2. Créez votre branche de fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. Committez vos modifications : `git commit -m 'feat: ajouter ma fonctionnalité'`
4. Poussez vers la branche : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

### Convention de commits
Ce projet suit la convention **Conventional Commits** :
- `feat:` — Nouvelle fonctionnalité
- `fix:` — Correction de bug
- `docs:` — Documentation
- `style:` — Formatage, style
- `refactor:` — Refactorisation du code
- `test:` — Ajout de tests
- `chore:` — Maintenance

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

> 🏦 *Application développée à des fins éducatives et de démonstration. BBVA est une marque déposée de Banco Bilbao Vizcaya Argentaria, S.A.*
