/**
 * Phone number utilities for TAVI
 * 
 * IMPORTANT: These functions transform phone numbers for DISPLAY purposes only.
 * The actual account number must be confirmed by the authorised account provider.
 * Never use the output of these functions as a live bank account number without
 * provider confirmation.
 */

export type PhoneValidationResult =
  | { valid: true; normalised: string; displayPattern: string; country: 'NG' }
  | { valid: false; error: string };

/**
 * Normalise a Nigerian phone number to E.164 format.
 * Accepts: 07074100290, +2347074100290, 2347074100290
 * Returns: +2347074100290
 */
export function normaliseNigerianPhone(input: string): PhoneValidationResult {
  const cleaned = input.replace(/[\s\-().]/g, '');

  // International format: +234XXXXXXXXXX
  if (/^\+234[0-9]{10}$/.test(cleaned)) {
    const localPart = cleaned.slice(4); // Remove +234
    if (!isValidNigerianLocalNumber(localPart)) {
      return { valid: false, error: 'This does not look like a valid Nigerian mobile number.' };
    }
    return {
      valid: true,
      normalised: cleaned,
      displayPattern: localPart,  // 7XXXXXXXXX
      country: 'NG',
    };
  }

  // Local format with 0: 0XXXXXXXXXX (11 digits)
  if (/^0[0-9]{10}$/.test(cleaned)) {
    const localPart = cleaned.slice(1); // Remove leading 0
    const e164 = '+234' + localPart;
    if (!isValidNigerianLocalNumber(localPart)) {
      return { valid: false, error: 'This does not look like a valid Nigerian mobile number.' };
    }
    return {
      valid: true,
      normalised: e164,
      displayPattern: localPart,  // 7XXXXXXXXX
      country: 'NG',
    };
  }

  // Without country code, no leading 0: 7XXXXXXXXX (10 digits starting with 7-9)
  if (/^[7-9][0-9]{9}$/.test(cleaned)) {
    const e164 = '+234' + cleaned;
    if (!isValidNigerianLocalNumber(cleaned)) {
      return { valid: false, error: 'This does not look like a valid Nigerian mobile number.' };
    }
    return {
      valid: true,
      normalised: e164,
      displayPattern: cleaned,
      country: 'NG',
    };
  }

  // Too short or unrecognised
  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number is too short. Please enter your full Nigerian mobile number.' };
  }

  if (cleaned.length > 14) {
    return { valid: false, error: 'Phone number is too long. Please check and try again.' };
  }

  return {
    valid: false,
    error: 'Please enter a valid Nigerian mobile number (e.g. 0703 000 0000 or +234 703 000 0000).',
  };
}

/**
 * Check that the local part (without 0 or +234) is a plausible Nigerian mobile.
 * Nigerian mobile numbers start with 7, 8, or 9 and are 10 digits total.
 */
function isValidNigerianLocalNumber(localPart: string): boolean {
  return /^[789][0-9]{9}$/.test(localPart);
}

/**
 * Format a display account number with spacing for readability.
 * 7074100290 → 7074 100 290
 */
export function formatAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return accountNumber;
}

/**
 * Mask an account number for display where partial masking is appropriate.
 * 7074100290 → ****100290
 */
export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `****${digits.slice(6)}`;
  }
  return '**********';
}

/**
 * Format a phone number for display.
 * +2347074100290 → 0707 410 0290
 */
export function formatPhoneDisplay(normalised: string): string {
  if (normalised.startsWith('+234') && normalised.length === 14) {
    const local = '0' + normalised.slice(4);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return normalised;
}
