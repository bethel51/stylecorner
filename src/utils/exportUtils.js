/**
 * Style Corner Dashboard Data Export Utility (CSV)
 */

export const exportOrdersToCSV = (orders = []) => {
  if (!orders || orders.length === 0) return false;

  const headers = [
    'Order ID',
    'Customer Name',
    'Email',
    'Phone',
    'Address',
    'Total Price (NGN)',
    'Status',
    'Items',
    'Created Date'
  ];

  const rows = orders.map((o) => {
    const itemsStr = Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((i) => `${i.name || i.title} (x${i.quantity || 1})`).join('; ')
      : (o.item || 'N/A');

    const cleanField = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    return [
      cleanField(o._id || ''),
      cleanField(o.name || o.customerInfo?.name || 'Customer'),
      cleanField(o.email || o.customerInfo?.email || ''),
      cleanField(o.phone || o.customerInfo?.phone || ''),
      cleanField(o.address || o.customerInfo?.address || ''),
      cleanField(o.totalPrice || o.price || 0),
      cleanField(o.status || 'pending'),
      cleanField(itemsStr),
      cleanField(o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `style_corner_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

export const exportBookingsToCSV = (bookings = []) => {
  if (!bookings || bookings.length === 0) return false;

  const headers = [
    'Booking ID',
    'Client Name',
    'Email',
    'Phone',
    'Service',
    'Stylist',
    'Date',
    'Time',
    'Status',
    'Created Date'
  ];

  const rows = bookings.map((b) => {
    const cleanField = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    return [
      cleanField(b._id || ''),
      cleanField(b.clientName || b.user?.firstname || 'Guest'),
      cleanField(b.clientEmail || b.email || ''),
      cleanField(b.phone || b.clientPhone || ''),
      cleanField(b.serviceName || b.service || ''),
      cleanField(b.stylist || 'Any Specialist'),
      cleanField(b.date || 'TBD'),
      cleanField(b.time || 'TBD'),
      cleanField(b.status || 'pending'),
      cleanField(b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `style_corner_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
