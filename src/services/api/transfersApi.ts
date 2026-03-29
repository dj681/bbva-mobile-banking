import type { Transfer, Beneficiary, TransactionStatus } from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface ScheduledTransfer extends Transfer {
  id: string;
  status: TransactionStatus;
  reference: string;
  nextExecutionDate: string;
}

export interface TransferResult {
  transferId: string;
  status: TransactionStatus;
  reference: string;
  message: string;
  executedAt: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

let MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-001',
    name: 'Marie Dupont',
    iban: 'FR76 2004 1010 0505 0013 0080 439',
    bank: 'BNP Paribas',
    alias: 'Mi hermana',
    isFavorite: true,
    lastTransferDate: new Date(Date.now() - 15 * 86_400_000).toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Marie+Dupont&background=e0e0e0',
  },
  {
    id: 'ben-002',
    name: 'Pierre Martin',
    iban: 'FR76 3000 3030 0037 4918 4550 014',
    bank: 'Société Générale',
    alias: 'Colega Pierre',
    isFavorite: true,
    lastTransferDate: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Pierre+Martin&background=e0e0e0',
  },
  {
    id: 'ben-003',
    name: 'Sophie Lefebvre',
    iban: 'FR76 1820 6004 3521 4567 8900 023',
    bank: 'Crédit Agricole',
    isFavorite: false,
    lastTransferDate: new Date(Date.now() - 45 * 86_400_000).toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Lefebvre&background=e0e0e0',
  },
  {
    id: 'ben-004',
    name: 'Thomas Bernard',
    iban: 'FR76 1751 5900 0008 0149 3808 049',
    bank: 'La Banque Postale',
    alias: 'Propietario',
    isFavorite: true,
    lastTransferDate: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Thomas+Bernard&background=e0e0e0',
  },
  {
    id: 'ben-005',
    name: 'Isabelle Moreau',
    iban: 'FR76 3000 6000 0198 7654 3200 999',
    bank: 'LCL',
    isFavorite: false,
    avatar: 'https://ui-avatars.com/api/?name=Isabelle+Moreau&background=e0e0e0',
  },
];

const MOCK_SCHEDULED_TRANSFERS: ScheduledTransfer[] = [
  {
    id: 'sched-001',
    fromAccountId: 'acc-001',
    beneficiaryId: 'ben-004',
    recipientName: 'Thomas Bernard',
    recipientIban: 'FR76 1751 5900 0008 0149 3808 049',
    amount: 800.00,
    currency: 'EUR',
    description: 'Alquiler mensual',
    type: 'scheduled',
    scheduledDate: new Date(new Date().setDate(1)).toISOString(),
    isRecurring: true,
    recurringInterval: 'monthly',
    status: 'pending',
    reference: 'SCHED-LOYER-001',
    nextExecutionDate: new Date(new Date().setDate(1)).toISOString(),
  },
  {
    id: 'sched-002',
    fromAccountId: 'acc-001',
    toAccountId: 'acc-002',
    recipientName: 'Cuenta de Ahorro BBVA',
    amount: 400.00,
    currency: 'EUR',
    description: 'Ahorro mensual automático',
    type: 'internal',
    scheduledDate: new Date(new Date().setDate(5)).toISOString(),
    isRecurring: true,
    recurringInterval: 'monthly',
    status: 'pending',
    reference: 'SCHED-EPARG-002',
    nextExecutionDate: new Date(new Date().setDate(5)).toISOString(),
  },
];

// ── API functions ────────────────────────────────────────────────────────────

export const executeTransferApi = async (
  transfer: Transfer,
): Promise<TransferResult> => {
  await delay(1000);

  if (!transfer.amount || transfer.amount <= 0) {
    throw new Error('El importe de la transferencia debe ser superior a 0 €.');
  }
  if (!transfer.fromAccountId) {
    throw new Error('Cuenta de origen requerida.');
  }

  return {
    transferId: `TRF-${Date.now()}`,
    status: 'completed',
    reference: `VIR${Date.now().toString().slice(-8)}`,
    message: `Transferencia de ${transfer.amount.toFixed(2)} € realizada con éxito.`,
    executedAt: new Date().toISOString(),
  };
};

export const fetchBeneficiariesApi = async (): Promise<Beneficiary[]> => {
  await delay(500);
  return [...MOCK_BENEFICIARIES];
};

export const addBeneficiaryApi = async (
  beneficiary: Omit<Beneficiary, 'id'>,
): Promise<Beneficiary> => {
  await delay(800);
  const newBeneficiary: Beneficiary = {
    ...beneficiary,
    id: `ben-${Date.now()}`,
  };
  MOCK_BENEFICIARIES.push(newBeneficiary);
  return { ...newBeneficiary };
};

export const deleteBeneficiaryApi = async (
  beneficiaryId: string,
): Promise<{ success: boolean }> => {
  await delay(600);
  const idx = MOCK_BENEFICIARIES.findIndex((b) => b.id === beneficiaryId);
  if (idx === -1) throw new Error(`Beneficiario no encontrado: ${beneficiaryId}`);
  MOCK_BENEFICIARIES.splice(idx, 1);
  return { success: true };
};

export const fetchScheduledTransfersApi = async (): Promise<
  ScheduledTransfer[]
> => {
  await delay(500);
  return [...MOCK_SCHEDULED_TRANSFERS];
};
