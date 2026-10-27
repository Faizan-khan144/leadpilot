export const toMinorUnits = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return Math.round(amount * 100)
}

export const toMajorUnits = (paise) => Number(paise || 0) / 100

export const formatMoney = (paise, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(toMajorUnits(paise))

export const percentageOf = (amountPaise, ratePercent) =>
  Math.round((Number(amountPaise) * Number(ratePercent)) / 100)

export const ratioOf = (numerator, denominator) =>
  denominator > 0 ? Math.min(1, Math.max(0, numerator / denominator)) : 0
