// lib/calculateFee.js
// Reads clients.fee_rule (jsonb) and returns a fee, or null if the
// rule is missing/unrecognized — callers decide what null means
// (right now: the order is created with no fee set, priced manually).
//
// Only 'flat' is supported for now. Distance- or weight-based pricing
// is real scope creep for a single client with one seeded fee_rule —
// worth designing properly once there's a second client whose needs
// actually differ from Corn Mart's.
export function calculateDeliveryFee(feeRule) {
  if (!feeRule || typeof feeRule !== 'object') return null

  if (feeRule.type === 'flat' && typeof feeRule.amount === 'number') {
    return feeRule.amount
  }

  return null
}
