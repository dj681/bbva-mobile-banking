import type { Credit, AmortizationEntry, CreditSimulation } from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface CreditApplicationRequest {
  type: string;
  amount: number;
  termMonths: number;
  purpose: string;
  monthlyIncome: number;
}

export interface EarlyPaymentRequest {
  creditId: string;
  amount: number;
  date: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

let MOCK_CREDITS: Credit[] = [
  {
    id: 'crd-001',
    type: 'personal',
    status: 'active',
    name: 'Crédit Personnel BBVA',
    originalAmount: 15_000.00,
    remainingAmount: 9_876.54,
    monthlyPayment: 298.45,
    interestRate: 4.9,
    startDate: '2022-03-01T00:00:00.000Z',
    endDate: '2027-03-01T00:00:00.000Z',
    nextPaymentDate: new Date(new Date().setDate(1)).toISOString(),
    nextPaymentAmount: 298.45,
    totalPaid: 5_371.10,
    currency: 'EUR',
    purpose: 'Travaux de rénovation appartement',
  },
  {
    id: 'crd-002',
    type: 'mortgage',
    status: 'active',
    name: 'Prêt Immobilier BBVA',
    originalAmount: 220_000.00,
    remainingAmount: 195_432.80,
    monthlyPayment: 1_045.60,
    interestRate: 2.85,
    startDate: '2021-06-15T00:00:00.000Z',
    endDate: '2046-06-15T00:00:00.000Z',
    nextPaymentDate: new Date(new Date().setDate(15)).toISOString(),
    nextPaymentAmount: 1_045.60,
    totalPaid: 24_567.20,
    currency: 'EUR',
    purpose: 'Acquisition résidence principale Paris 11e',
  },
];

// ── Amortization calculator ──────────────────────────────────────────────────

function buildAmortizationSchedule(
  amount: number,
  termMonths: number,
  annualRate: number,
): AmortizationEntry[] {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? amount / termMonths
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule: AmortizationEntry[] = [];
  let balance = amount;
  const startDate = new Date();

  for (let m = 1; m <= termMonths; m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    const entryDate = new Date(startDate);
    entryDate.setMonth(startDate.getMonth() + m);

    schedule.push({
      month: m,
      payment: parseFloat(monthlyPayment.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      date: entryDate.toISOString(),
    });
  }

  return schedule;
}

// ── API functions ────────────────────────────────────────────────────────────

export const fetchCreditsApi = async (): Promise<Credit[]> => {
  await delay(600);
  return [...MOCK_CREDITS];
};

export const fetchCreditDetailsApi = async (
  creditId: string,
): Promise<{ credit: Credit; amortizationSchedule: AmortizationEntry[] }> => {
  await delay(700);
  const credit = MOCK_CREDITS.find((c) => c.id === creditId);
  if (!credit) throw new Error(`Crédit introuvable : ${creditId}`);

  const schedule = buildAmortizationSchedule(
    credit.remainingAmount,
    Math.round(
      (new Date(credit.endDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24 * 30),
    ),
    credit.interestRate,
  );

  return { credit: { ...credit }, amortizationSchedule: schedule };
};

export const simulateCreditApi = async (
  amount: number,
  termMonths: number,
  interestRate: number,
): Promise<CreditSimulation> => {
  await delay(400);

  const schedule = buildAmortizationSchedule(amount, termMonths, interestRate);
  const monthlyPayment = schedule[0]?.payment ?? 0;
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - amount;

  return {
    amount,
    termMonths,
    interestRate,
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
    schedule,
  };
};

export const requestCreditApi = async (
  _application: CreditApplicationRequest,
): Promise<{ applicationId: string; status: string; message: string }> => {
  await delay(1200);
  return {
    applicationId: `APP-${Date.now()}`,
    status: 'pending_approval',
    message:
      'Votre demande de crédit a été reçue. Vous recevrez une réponse dans les 48 heures.',
  };
};

export const makeEarlyPaymentApi = async (
  request: EarlyPaymentRequest,
): Promise<{ success: boolean; newRemainingAmount: number; message: string }> => {
  await delay(900);
  const idx = MOCK_CREDITS.findIndex((c) => c.id === request.creditId);
  if (idx === -1) throw new Error(`Crédit introuvable : ${request.creditId}`);

  const newRemaining = Math.max(
    0,
    MOCK_CREDITS[idx].remainingAmount - request.amount,
  );
  MOCK_CREDITS[idx] = {
    ...MOCK_CREDITS[idx],
    remainingAmount: newRemaining,
    totalPaid: MOCK_CREDITS[idx].totalPaid + request.amount,
  };

  return {
    success: true,
    newRemainingAmount: newRemaining,
    message: `Remboursement anticipé de ${request.amount} € effectué avec succès.`,
  };
};
