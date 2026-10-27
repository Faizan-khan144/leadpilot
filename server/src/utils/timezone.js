const zoneParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
}

const zoneOffsetMs = (date, timeZone) => {
  const parts = zoneParts(date, timeZone)
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - date.getTime()
}

export const startOfDayInTimeZone = (date, timeZone) => {
  const parts = zoneParts(date, timeZone)
  const offset = zoneOffsetMs(date, timeZone)
  return new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) - offset,
  )
}

export const endOfDayInTimeZone = (date, timeZone) =>
  new Date(startOfDayInTimeZone(date, timeZone).getTime() + 24 * 60 * 60 * 1000 - 1)

export const addDays = (date, days) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
