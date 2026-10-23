/**
 * Calendar Integration Utilities for Style Corner
 * Generates universal Google, Apple iCal, Outlook, and Yahoo calendar events
 */

/**
 * Parses date string (e.g. "2026-10-18") and time string (e.g. "11:00 AM", "14:30") into Start and End Date objects.
 */
export function parseBookingDateTime(dateStr, timeStr, durationMinutes = 60) {
  const now = new Date();
  let start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // fallback: tomorrow

  if (dateStr) {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      let hours = 10;
      let minutes = 0;

      if (timeStr) {
        const timeMatch = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const meridian = timeMatch[3];
          if (meridian) {
            if (meridian.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
        }
      }

      start = new Date(Date.UTC(year, month, day, hours, minutes, 0));
    }
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
}

/**
 * Converts a Date object to UTC ISO format for calendar URLs (e.g., 20261018T100000Z)
 */
function toUtcIso(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates Google Calendar web add link
 */
export function getGoogleCalendarUrl(booking) {
  const { start, end } = parseBookingDateTime(booking.date, booking.time);
  const title = encodeURIComponent(`Style Corner: ${booking.service || 'Grooming Session'} with ${booking.stylist || 'Stylist'}`);
  const details = encodeURIComponent(
    `Bespoke Grooming & Atelier Session at Style Corner.\n\n` +
    `• Specialist: ${booking.stylist || 'Verified Specialist'}\n` +
    `• Service: ${booking.service || 'Hair & Grooming'}\n` +
    `• Pass Code: ${booking.checkInCode || 'SC-PASS'}\n` +
    `• Client: ${booking.clientName || 'Valued Client'}\n` +
    `• Location: ${booking.location || 'Style Corner Atelier'}\n\n` +
    `Check in with your digital pass on arrival: https://www.stylecorner.world/customer-dashboard`
  );
  const location = encodeURIComponent(booking.location || 'Style Corner Atelier, Lagos');
  const dates = `${toUtcIso(start)}/${toUtcIso(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Generates Outlook Calendar web link
 */
export function getOutlookCalendarUrl(booking) {
  const { start, end } = parseBookingDateTime(booking.date, booking.time);
  const subject = encodeURIComponent(`Style Corner: ${booking.service || 'Grooming Session'} with ${booking.stylist || 'Stylist'}`);
  const body = encodeURIComponent(
    `Bespoke Grooming & Atelier Session with ${booking.stylist}.\nPass Code: ${booking.checkInCode || 'SC-PASS'}`
  );
  const location = encodeURIComponent(booking.location || 'Style Corner Atelier');
  const startdt = start.toISOString();
  const enddt = end.toISOString();

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}&location=${location}`;
}

/**
 * Generates and triggers download of an Apple Calendar / iCal (.ics) file
 */
export function downloadIcsFile(booking) {
  const { start, end } = parseBookingDateTime(booking.date, booking.time);
  const dtStart = toUtcIso(start);
  const dtEnd = toUtcIso(end);
  const dtStamp = toUtcIso(new Date());
  const uid = `bkg-${booking._id || Date.now()}@stylecorner.world`;
  const summary = `Style Corner: ${booking.service || 'Grooming Session'} with ${booking.stylist || 'Stylist'}`;
  const description = `Bespoke Grooming & Atelier Session\\n\\nSpecialist: ${booking.stylist}\\nService: ${booking.service}\\nPass Code: ${booking.checkInCode || 'SC-PASS'}\\nLocation: ${booking.location || 'Style Corner Atelier'}\\n\\nManage: https://www.stylecorner.world/customer-dashboard`;
  const location = (booking.location || 'Style Corner Atelier, Lagos').replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Style Corner Atelier//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Style Corner appointment in 2 hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `stylecorner-${booking.checkInCode || 'appointment'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
