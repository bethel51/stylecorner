/**
 * Utility to generate and print/download a luxury HTML receipt invoice for store orders.
 */
export const printOrderInvoice = (order) => {
  if (!order) return;

  const orderNum = String(order._id || '').slice(-6).toUpperCase();
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : new Date().toLocaleDateString();

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Style Corner — Official Order Invoice #${orderNum}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 40px;
            color: #171717;
            background-color: #ffffff;
          }
          .invoice-box {
            max-width: 700px;
            margin: auto;
            border: 1.5px solid #d4af37;
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #171717;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .brand {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #171717;
          }
          .brand span {
            color: #d4af37;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            margin: 0;
            font-size: 18px;
            color: #d4af37;
          }
          .invoice-title p {
            margin: 3px 0 0;
            font-size: 13px;
            color: #6b7280;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
            background: #faf9f5;
            padding: 20px;
            border-radius: 14px;
          }
          .grid-item span {
            display: block;
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }
          .grid-item strong {
            font-size: 14px;
            color: #171717;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            background: #171717;
            color: #d4af37;
            font-weight: 800;
            text-align: left;
            padding: 12px;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #171717;
            color: #ffffff;
            padding: 18px 25px;
            border-radius: 14px;
          }
          .total-box span {
            font-size: 13px;
            color: #d4af37;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .total-box h3 {
            margin: 0;
            font-size: 24px;
            color: #ffffff;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px dashed #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="brand">
              STYLE <span>CORNER</span>
            </div>
            <div class="invoice-title">
              <h2>OFFICIAL RECEIPT</h2>
              <p>Order #${orderNum} · ${dateStr}</p>
            </div>
          </div>

          <div class="grid">
            <div class="grid-item">
              <span>Customer Details</span>
              <strong>${order.name || 'Valued Customer'}</strong><br/>
              <small style="color: #6b7280;">${order.email || ''} · ${order.phone || ''}</small>
            </div>
            <div class="grid-item">
              <span>Delivery Address</span>
              <strong>${order.address || `${order.houseNumber || ''} ${order.street || ''}, ${order.lga || ''}, ${order.state || ''}`}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${order.item || 'Grooming Store Purchase'}</strong></td>
                <td style="text-align: right; font-weight: 800;">₦${Number(order.totalPrice || order.price || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <span>FINAL AMOUNT PAID</span>
            <h3>₦${Number(order.totalPrice || order.price || 0).toLocaleString()}</h3>
          </div>

          <div class="footer">
            Thank you for shopping with <strong>Style Corner Atelier</strong>.<br/>
            Need assistance with this order? Contact support at support@stylecorner.com
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
