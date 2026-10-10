// Reads clients.fee_rule (jsonb) and returns a delivery fee.
//
// Two supported types:
//   'flat'    — { type: 'flat', amount: 25 } — unchanged from before
//   'tiered'  — { type: 'tiered', tiers: [{ key, label, price, ... }] }
//               Price depends on which tier the SELLER picks at ship
//               time (see parcel_size on POST /api/v1/deliveries),
//               not on an auto-computed formula. Weight/item-count
//               guidance lives in each tier's optional
//               max_weight_kg/max_items fields — display-only hints
//               for the seller, not inputs to a calculation. A human
//               is already confirming the shipment at that point, so
//               a formula would just be a second, competing source
//               of truth for the same number.
//
// Returns { fee, error, tiers }:
//   - fee: the resolved number, or null if it couldn't be resolved
//   - error: a message explaining why, or null on success
//   - tiers: included whenever error is set on a 'tiered' rule, so
//     the caller (e.g. Corn Mart's ship confirmation dialog) can
//     show the valid options without a second request
export function calculateDeliveryFee(feeRule, { parcelSize } = {}) {
  if (!feeRule || typeof feeRule !== 'object') {
    return { fee: null, error: null, tiers: null }
  }

  if (feeRule.type === 'flat') {
    if (typeof feeRule.amount !== 'number') {
      return { fee: null, error: 'Flat fee_rule is missing amount', tiers: null }
    }
    return { fee: feeRule.amount, error: null, tiers: null }
  }

  if (feeRule.type === 'tiered') {
    const tiers = Array.isArray(feeRule.tiers) ? feeRule.tiers : []

    if (tiers.length === 0) {
      return { fee: null, error: 'No pricing tiers configured for this client', tiers: [] }
    }

    if (!parcelSize) {
      return { fee: null, error: 'parcel_size is required for this client', tiers }
    }

    const tier = tiers.find((t) => t.key === parcelSize)
    if (!tier) {
      return {
        fee: null,
        error: `Unknown parcel_size "${parcelSize}"`,
        tiers,
      }
    }

    return { fee: tier.price, error: null, tiers: null }
  }

  return { fee: null, error: `Unrecognized fee_rule type "${feeRule.type}"`, tiers: null }
}
