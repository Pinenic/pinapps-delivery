// Supabase phone auth requires E.164 (+260...). People type numbers
// every other way — 097..., 0097..., +260 97..., with spaces. This
// normalizes the common Zambian forms rather than rejecting input
// that's obviously valid but formatted differently.

const ZM_CODE = '260'

export function normalizeZambianPhone(input) {
  if (!input) return null

  // Strip everything that isn't a digit or leading +
  let digits = String(input).replace(/[^\d+]/g, '')
  digits = digits.replace(/(?!^)\+/g, '')

  if (digits.startsWith('+')) {
    digits = digits.slice(1)
  }

  // 00260... international prefix
  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }

  // Local form: 0977123456 → 260977123456
  if (digits.startsWith('0')) {
    digits = ZM_CODE + digits.slice(1)
  }

  // Bare national number: 977123456 → 260977123456
  if (!digits.startsWith(ZM_CODE) && digits.length === 9) {
    digits = ZM_CODE + digits
  }

  if (!digits.startsWith(ZM_CODE)) return null

  const national = digits.slice(ZM_CODE.length)
  // Zambian mobile numbers are 9 digits after the country code
  if (national.length !== 9) return null

  return `+${digits}`
}

export function formatZambianPhone(e164) {
  if (!e164) return ''
  const national = e164.replace(/^\+260/, '')
  if (national.length !== 9) return e164
  return `+260 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
}
