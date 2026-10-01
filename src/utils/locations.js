// Style Corner Active Service Locations
// Currently strictly operating in Lagos and Ibadan (Oyo State)

export const SUPPORTED_STATES = [
  {
    name: 'Lagos',
    label: 'Lagos State',
    lgas: [
      'Ikeja',
      'Eti-Osa (Lekki / Victoria Island / Ikoyi)',
      'Lagos Island',
      'Lagos Mainland (Yaba / Surulere)',
      'Surulere',
      'Alimosho',
      'Kosofe (Magodo / Maryland)',
      'Oshodi-Isolo',
      'Agege',
      'Ikorodu',
      'Amuwo-Odofin (Festac)',
      'Apapa',
      'Ifako-Ijaiye',
      'Mushin',
      'Ojo',
      'Shomolu',
      'Badagry',
      'Epe'
    ]
  },
  {
    name: 'Oyo',
    label: 'Oyo State (Ibadan)',
    lgas: [
      'Ibadan North (Bodija, Agodi, UI)',
      'Ibadan North-East (Agugu, Iwo Road)',
      'Ibadan North-West (Dugbe, Mokola)',
      'Ibadan South-East (Mapo, Molete)',
      'Ibadan South-West (Ring Road, Oluyole)',
      'Akinyele (Moniya, Ojoo)',
      'Egbeda',
      'Iddo',
      'Lagelu',
      'Oluyole'
    ]
  }
];

export const ALL_LOCATIONS_DISPLAY = [
  'Ikeja, Lagos',
  'Eti-Osa (Lekki / Victoria Island / Ikoyi), Lagos',
  'Lagos Mainland (Yaba / Surulere), Lagos',
  'Kosofe (Magodo / Maryland), Lagos',
  'Amuwo-Odofin (Festac), Lagos',
  'Surulere, Lagos',
  'Ibadan North (Bodija, Agodi, UI), Oyo',
  'Ibadan South-West (Ring Road, Oluyole), Oyo',
  'Ibadan North-West (Dugbe, Mokola), Oyo',
  'Egbeda, Oyo',
];

// Helper to normalize and check if two LGAs or areas match
export const isSameLga = (lga1, lga2) => {
  if (!lga1 || !lga2) return false;
  const clean1 = String(lga1).toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = String(lga2).toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean1.includes(clean2) || clean2.includes(clean1);
};

// Helper to check if two states match
export const isSameState = (state1, state2) => {
  if (!state1 || !state2) return false;
  const clean1 = String(state1).toLowerCase();
  const clean2 = String(state2).toLowerCase();
  if (clean1.includes('lagos') && clean2.includes('lagos')) return true;
  if ((clean1.includes('oyo') || clean1.includes('ibadan')) && (clean2.includes('oyo') || clean2.includes('ibadan'))) return true;
  return clean1 === clean2;
};
