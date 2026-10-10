// Single source of truth for delivery status display and progression,
// shared by admin and rider pages so they never drift out of sync.

export const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export const STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-yellow-100 text-yellow-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
}

// What a rider can move a job to next, and the button label for doing it.
// No entry (e.g. 'pending', 'delivered') means no rider action applies.
export const NEXT_STATUS = {
  assigned: 'picked_up',
  picked_up: 'in_transit',
  in_transit: 'delivered',
}

export const NEXT_ACTION_LABEL = {
  assigned: 'Mark picked up',
  picked_up: 'Mark in transit',
  in_transit: 'Mark delivered',
}
