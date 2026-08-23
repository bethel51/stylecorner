/**
 * Export booking history to CSV with UTF-8 BOM for Microsoft Excel / Numbers compatibility
 */
export const downloadBookingHistoryCSV = (bookings, filename = 'StyleCorner_Booking_History.csv') => {
  if (!bookings || bookings.length === 0) return false;

  const headers = [
    'Booking ID',
    'Service',
    'Specialist / Stylist',
    'Client Name',
    'Client Email',
    'Client Phone',
    'Date',
    'Time',
    'Price ($)',
    'Status',
    'Created At'
  ];

  const rows = bookings.map(b => [
    `"${b._id || ''}"`,
    `"${(b.service || '').replace(/"/g, '""')}"`,
    `"${(b.stylist || '').replace(/"/g, '""')}"`,
    `"${(b.clientName || b.clientEmail || '').replace(/"/g, '""')}"`,
    `"${(b.clientEmail || '').replace(/"/g, '""')}"`,
    `"${(b.clientPhone || '').replace(/"/g, '""')}"`,
    `"${b.date || ''}"`,
    `"${b.time || ''}"`,
    `"${b.price || 0}"`,
    `"${(b.status || '').toUpperCase()}"`,
    `"${b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}"`
  ]);

  // Include UTF-8 Byte Order Mark (\uFEFF) so Excel and spreadsheet viewers recognize UTF-8 encoding and separate columns properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  return true;
};

/**
 * Open a beautifully formatted printable HTML / PDF report for booking history
 */
export const printBookingHistoryReport = (bookings, userTitle = 'Booking History Statement') => {
  if (!bookings || bookings.length === 0) return false;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const rowsHtml = bookings.map((b, idx) => `
    <tr style="border-bottom: 1px solid #e5e7eb; background: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
      <td style="padding: 10px 12px; font-weight: bold; font-family: monospace; font-size: 0.85rem; color: #171717;">#${String(b._id || idx + 1).slice(-6).toUpperCase()}</td>
      <td style="padding: 10px 12px; font-size: 0.9rem; font-weight: 600; color: #171717;">${b.service || 'Service'}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${b.stylist || 'Specialist'}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${b.clientName || b.clientEmail || 'Client'}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${b.date || ''} @ ${b.time || ''}</td>
      <td style="padding: 10px 12px; font-size: 0.9rem; font-weight: bold; color: #b5952f;">$${b.price || 0}</td>
      <td style="padding: 10px 12px;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 50px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; 
          background: ${b.status === 'completed' ? '#d1fae5' : b.status === 'accepted' ? '#dbeafe' : b.status === 'pending' ? '#fef3c7' : '#fee2e2'};
          color: ${b.status === 'completed' ? '#047857' : b.status === 'accepted' ? '#1e40af' : b.status === 'pending' ? '#b45309' : '#b91c1c'};">
          ${b.status || 'STATUS'}
        </span>
      </td>
    </tr>
  `).join('');

  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Style Corner - ${userTitle}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #171717; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d4af37; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .logo { font-size: 1.5rem; font-weight: 900; color: #171717; letter-spacing: -0.02em; }
          .logo span { color: #d4af37; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; text-align: left; }
          th { background: #171717; color: #ffffff; padding: 10px 12px; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary { display: flex; justify-content: space-between; margin-top: 1.5rem; padding: 1rem; background: #faf9f5; border: 1px solid #e5e7eb; border-radius: 8px; }
          .btn-print { background: #d4af37; color: #fff; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">STYLE <span>CORNER</span></div>
            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 2px;">Official Booking History Statement</div>
          </div>
          <div class="no-print">
            <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
          </div>
        </div>

        <h2 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${userTitle}</h2>
        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Stylist</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div><strong>Total Records:</strong> ${bookings.length} Bookings</div>
          <div><strong>Total Value:</strong> <span style="font-size: 1.2rem; color: #d4af37; font-weight: 900;">$${totalSpent}</span></div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};
