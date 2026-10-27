export const toCsv = (rows, columns) => {
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const header = columns.map((column) => escape(column.label)).join(',')
  const body = rows
    .map((row) =>
      columns.map((column) => escape(column.value(row))).join(','),
    )
    .join('\n')

  return `${header}\n${body}`
}

export const sendCsv = (res, filename, csv) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.status(200).send(`\uFEFF${csv}`)
}
