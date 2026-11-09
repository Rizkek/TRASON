export const netBalance = (rows: { type: string; amount: number }[]): number =>
  rows.reduce((sum, row) => (row.type === 'income' ? sum + row.amount : sum - row.amount), 0);
