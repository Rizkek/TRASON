export interface DigestData {
  userName: string;
  period: string; // 'Daily', 'Weekly', 'Monthly'
  dateStr: string;
  stats: {
    tasksCompleted: number;
    tasksTotal: number;
    remindersCompleted: number;
    financeIncome: number;
    financeExpense: number;
    currency: string;
  };
}

const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function generateDigestEmailHTML(data: DigestData): string {
  const { userName, period, dateStr, stats } = data;
  const taskCompletionRate = stats.tasksTotal > 0 
    ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) 
    : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #000000;
      color: #E6E1D8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #0A0A0A;
      border: 1px solid #1A1A1A;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #1A1A1A;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #D4AF37;
      margin: 0;
      text-transform: uppercase;
    }
    h1 {
      font-size: 20px;
      font-weight: 400;
      margin: 20px 0 5px 0;
    }
    .date {
      color: #8C8C8C;
      font-size: 14px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .card {
      background-color: #121212;
      border: 1px solid #1A1A1A;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #D4AF37;
      margin: 0 0 15px 0;
    }
    .stat-grid {
      display: table;
      width: 100%;
    }
    .stat-row {
      display: table-row;
    }
    .stat-cell {
      display: table-cell;
      padding: 10px 0;
      border-bottom: 1px solid #1A1A1A;
    }
    .stat-row:last-child .stat-cell {
      border-bottom: none;
    }
    .stat-label {
      color: #8C8C8C;
      font-size: 14px;
    }
    .stat-value {
      text-align: right;
      font-size: 16px;
      font-weight: 600;
    }
    .income { color: #8BA888; }
    .expense { color: #C27A7A; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #1A1A1A;
      font-size: 12px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="logo">TRASON</p>
      <h1>Your ${period} Digest</h1>
      <p class="date">${dateStr}</p>
    </div>

    <div class="greeting">
      Hello ${userName},<br>
      Here is your summary of activities and finances for the ${period.toLowerCase()}.
    </div>

    <div class="card">
      <h2 class="card-title">Productivity</h2>
      <div class="stat-grid">
        <div class="stat-row">
          <div class="stat-cell stat-label">Tasks Completed</div>
          <div class="stat-cell stat-value">${stats.tasksCompleted} / ${stats.tasksTotal} (${taskCompletionRate}%)</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell stat-label">Reminders Cleared</div>
          <div class="stat-cell stat-value">${stats.remindersCompleted}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">Finance</h2>
      <div class="stat-grid">
        <div class="stat-row">
          <div class="stat-cell stat-label">Total Income</div>
          <div class="stat-cell stat-value income">+${formatMoney(stats.financeIncome, stats.currency)}</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell stat-label">Total Expense</div>
          <div class="stat-cell stat-value expense">-${formatMoney(stats.financeExpense, stats.currency)}</div>
        </div>
        <div class="stat-row">
          <div class="stat-cell stat-label">Net Flow</div>
          <div class="stat-cell stat-value" style="color: ${stats.financeIncome >= stats.financeExpense ? '#8BA888' : '#C27A7A'}">
            ${stats.financeIncome >= stats.financeExpense ? '+' : '-'}${formatMoney(Math.abs(stats.financeIncome - stats.financeExpense), stats.currency)}
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated digest from your TRASON sanctuary.</p>
      <p>You can manage your notification preferences in Settings > Alerts.</p>
    </div>
  </div>
</body>
</html>
  `;
}
