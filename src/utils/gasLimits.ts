/**
 * Gas limit utilities for transactions
 *
 * Sepolia network has a gas limit cap of 16,777,216 (0xFFFFFF)
 * We need to ensure our transactions don't exceed this limit
 */

// Maximum gas limit for Sepolia
export const SEPOLIA_MAX_GAS_LIMIT = 16_777_216;

// Safe gas limits for different operations
export const GAS_LIMITS = {
  // Assessor operations
  REGISTER_ASSESSOR: 150_000,
  CERTIFY_ASSESSOR: 100_000,

  // Assessment operations
  SUBMIT_ASSESSMENT: 500_000, // Reduced from default
  VERIFY_ASSESSMENT: 200_000,

  // View operations (shouldn't need gas, but just in case)
  GET_ASSESSMENT: 100_000,
  GET_REPORT: 100_000,

  // Default fallback
  DEFAULT: 300_000,
} as const;

/**
 * Get safe gas limit for a transaction
 * @param operation - The operation type
 * @param defaultLimit - Optional default limit
 * @returns A safe gas limit that won't exceed network cap
 */
export function getSafeGasLimit(
  operation: keyof typeof GAS_LIMITS,
  defaultLimit?: bigint
): bigint {
  const limit = GAS_LIMITS[operation];

  // If we have a default limit from estimation, use the lower of the two
  if (defaultLimit) {
    const estimatedLimit = Number(defaultLimit);
    if (estimatedLimit < limit && estimatedLimit < SEPOLIA_MAX_GAS_LIMIT) {
      return defaultLimit;
    }
  }

  return BigInt(limit);
}

/**
 * Validate gas limit doesn't exceed network cap
 * @param gasLimit - The gas limit to validate
 * @returns True if valid, false if too high
 */
export function isValidGasLimit(gasLimit: bigint | number): boolean {
  const limit = typeof gasLimit === 'bigint' ? Number(gasLimit) : gasLimit;
  return limit <= SEPOLIA_MAX_GAS_LIMIT;
}

/**
 * Cap gas limit to network maximum
 * @param gasLimit - The gas limit to cap
 * @returns Capped gas limit
 */
export function capGasLimit(gasLimit: bigint | number): bigint {
  const limit = typeof gasLimit === 'bigint' ? gasLimit : BigInt(gasLimit);
  const maxLimit = BigInt(SEPOLIA_MAX_GAS_LIMIT);

  return limit > maxLimit ? maxLimit : limit;
}
