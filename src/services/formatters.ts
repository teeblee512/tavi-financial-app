/**
 * Financial formatting utilities for TAVI.
 * Uses integer kobo arithmetic throughout to avoid floating point errors.
 */

/**
 * Format kobo as a Naira string with commas.
 * 845_650_00 → "₦845,650.00"
 */
export function formatNaira(kobo: number, showCurrency = true): string {
  const naira = kobo / 100;
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
  return showCurrency ? `₦${formatted}` : formatted;
}

/**
 * Format a generic currency amount.
 */
export function formatCurrency(
  minorUnits: number,
  currency: string,
  minorUnitDivisor = 100,
): string {
  const major = minorUnits / minorUnitDivisor;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Format a number as a plain naira figure without the ₦ symbol.
 * Useful for inputs and compact displays.
 */
export function formatNairaPlain(kobo: number): string {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/**
 * Parse a naira string input back to kobo integer.
 * Accepts: "1,234.56", "1234.56", "1234", "₦1,234.56"
 */
export function parseNairaToKobo(input: string): number | null {
  const cleaned = input.replace(/[₦,\s]/g, '');
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  // Round to nearest kobo
  return Math.round(value * 100);
}

/**
 * Format a transaction date relative to now.
 */
export function formatTransactionDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-NG', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format a date for statement headers, reminders etc.
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date relative to today (e.g. "Due in 3 days").
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 8) return `In ${diffDays} days`;
  return formatDate(isoDate);
}

/**
 * Get a time-of-day greeting.
 */
export function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

/**
 * Compute net flow from a set of transactions for a given counterparty name.
 */
export function computeCounterpartyFlow(
  transactions: { direction: string; amountKobo: number; counterpartyName: string }[],
  name: string,
) {
  const matches = transactions.filter(
    (t) => t.counterpartyName.toLowerCase().includes(name.toLowerCase()),
  );
  let sent = 0;
  let received = 0;
  matches.forEach((t) => {
    if (t.direction === 'debit') sent += t.amountKobo;
    else received += t.amountKobo;
  });
  return { sent, received, net: received - sent, count: matches.length };
}

/**
 * Category display labels.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  transfer: 'Transfer',
  airtime: 'Airtime',
  data: 'Mobile Data',
  electricity: 'Electricity',
  cable_tv: 'Cable TV',
  internet: 'Internet',
  gift_card: 'Gift Card',
  add_money: 'Added Funds',
  request: 'Money Request',
  investment: 'Investment',
  fx: 'FX Exchange',
  bill: 'Bill Payment',
  other: 'Other',
};

/**
 * Status display labels.
 */
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  awaiting_auth: 'Awaiting Authorisation',
  submitted: 'Submitted',
  processing: 'Processing',
  successful: 'Successful',
  failed: 'Failed',
  pending_confirmation: 'Pending',
  reversed: 'Reversed',
  refunded: 'Refunded',
};
