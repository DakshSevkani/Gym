export interface ReceiptPaymentData {
  id?: string;
  paymentId?: string | number;
  transactionId?: string;
  memberId?: string;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  planName?: string;
  amount?: number;
  date?: string;
  paymentDate?: string;
  method?: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

export function generateReceiptHtml(payment: ReceiptPaymentData): string {
  const txnId = String(payment.transactionId || (payment.paymentId ? `TXN_${payment.paymentId}` : `TXN_${payment.id || Date.now()}`));
  const memberName = payment.memberName || 'Valued Member';
  const memberEmail = payment.memberEmail || 'member@powerhouse.gym';
  const memberPhone = payment.memberPhone || '+1 (555) 019-2834';
  const plan = payment.planName || 'Gym Membership Access';
  const amountNum = Number(payment.amount || 0);
  const paymentDate = payment.paymentDate || payment.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const paymentMethod = payment.paymentMethod || payment.method || 'UPI QR / Online';
  const status = (payment.status || 'COMPLETED').toUpperCase();

  const subtotal = (amountNum * 0.82).toFixed(2);
  const tax = (amountNum * 0.18).toFixed(2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PowerHouse Gym Receipt - ${txnId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt-container {
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      position: relative;
      overflow: hidden;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(16, 185, 129, 0.04);
      pointer-events: none;
      user-select: none;
      letter-spacing: 4px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 44px;
      height: 44px;
      background: #2563eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
    }

    .brand-text h1 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
    }

    .brand-text p {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status-badge {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 28px;
    }

    .meta-col h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .meta-col p {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }

    .meta-col span {
      font-size: 12px;
      color: #64748b;
      display: block;
      margin-top: 2px;
    }

    .table-container {
      margin-bottom: 28px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th {
      text-align: left;
      padding: 12px 16px;
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th:last-child, td:last-child {
      text-align: right;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .item-name {
      font-weight: 700;
      color: #0f172a;
    }

    .item-desc {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .totals {
      margin-left: auto;
      width: 280px;
      margin-bottom: 32px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #64748b;
    }

    .totals-row.final {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .totals-row.final strong {
      color: #059669;
    }

    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }

    .footer-left p {
      margin-bottom: 3px;
    }

    .signature-area {
      text-align: right;
    }

    .signature-img {
      font-family: 'Brush Script MT', cursive, sans-serif;
      font-size: 22px;
      color: #2563eb;
      margin-bottom: 2px;
    }

    .signature-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="watermark">PAID</div>

    <div class="header">
      <div class="brand">
        <div class="logo-badge">⚡</div>
        <div class="brand-text">
          <h1>POWERHOUSE GYM</h1>
          <p>Official Payment Receipt & Tax Invoice</p>
        </div>
      </div>
      <div class="status-badge">${status}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <h3>Billed To (Member)</h3>
        <p>${memberName}</p>
        <span>${memberEmail}</span>
        <span>${memberPhone}</span>
      </div>
      <div class="meta-col">
        <h3>Receipt Details</h3>
        <p>Invoice #: <strong style="font-family: monospace; color:#2563eb;">${txnId}</strong></p>
        <span>Date: ${paymentDate}</span>
        <span>Method: ${paymentMethod}</span>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Billing Cycle</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-name">${plan}</div>
              <div class="item-desc">Full gym floor access, locker facility & locker room amenities</div>
            </td>
            <td>Recurring / One-Time</td>
            <td style="font-weight: 700; color: #0f172a;">₹${amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-row">
        <span>Base Membership Amount:</span>
        <span>₹${Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row">
        <span>GST & Service Tax (18%):</span>
        <span>₹${Number(tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row final">
        <span>Total Amount Paid:</span>
        <strong>₹${amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</strong>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">
        <p><strong>PowerHouse Gym & Fitness Club</strong></p>
        <p>1200 Fitness Boulevard, Downtown Metro</p>
        <p>Support: support@powerhouse.gym | +1 (800) 555-0199</p>
        <p style="margin-top: 6px; font-size: 10px; color: #cbd5e1;">Generated electronically on ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</p>
      </div>
      <div class="signature-area">
        <div class="signature-img">PowerHouse Gym Auth</div>
        <div class="signature-label">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a standalone HTML invoice/receipt file to the user's computer.
 */
export function downloadReceiptFile(payment: ReceiptPaymentData): void {
  const htmlContent = generateReceiptHtml(payment);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const txnId = String(payment.transactionId || payment.paymentId || payment.id || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  a.href = url;
  a.download = `PowerHouse_Receipt_${txnId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens an isolated print preview dialog for the invoice, allowing instant "Save as PDF" or physical printing.
 */
export function printReceiptDirectly(payment: ReceiptPaymentData): void {
  const htmlContent = generateReceiptHtml(payment);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to apply before prompting print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  } else {
    // Fallback if popup blocker intercepted
    window.print();
  }
}
