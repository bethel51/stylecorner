export const downloadBookingHistoryCSV = (bookings, filename = 'StyleCorner_Booking_History.csv') => {
  if (!bookings || bookings.length === 0) return false;

  const headers = ['Booking ID', 'Service', 'Specialist / Stylist', 'Client Name', 'Client Email', 'Client Phone', 'Date', 'Time', 'Price ($)', 'Status', 'Created At'];

  const rows = bookings.map(b => [
    `"${b._id || ''}"`,
    `"${(b.service || '').replace(/"/g, '""')}"`,
    `"${(b.stylist || '').replace(/"/g, '""')}"`,
    `"${(b.clientName || '').replace(/"/g, '""')}"`,
    `"${(b.clientEmail || '').replace(/"/g, '""')}"`,
    `"${(b.clientPhone || '').replace(/"/g, '""')}"`,
    `"${b.date || ''}"`,
    `"${b.time || ''}"`,
    `"${b.price || 0}"`,
    `"${b.status || ''}"`,
    `"${b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};
