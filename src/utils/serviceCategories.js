// Standard 6 Core Service Categories in StyleCorner Atelier
export const CORE_CATEGORIES = [
  'Lash Tech',
  'Nail Tech',
  'Hair Braider & Stylist',
  'Barber',
  'Makeup Artist',
  'Wig Installer & Revamper',
];

// Map shorthand IDs / URL slugs / keywords to official Core Category Name
export const getServiceCategory = (serviceIdentifier) => {
  if (!serviceIdentifier) return '';
  const s = String(serviceIdentifier).toLowerCase().trim();

  if (s.includes('lash')) return 'Lash Tech';
  if (s.includes('nail') || s.includes('manicure') || s.includes('pedicure') || s.includes('acrylic')) return 'Nail Tech';
  if (s.includes('braid') || s.includes('twist') || s.includes('locs') || s.includes('cornrow') || s.includes('braider') || s.includes('knotless')) {
    return 'Hair Braider & Stylist';
  }
  if (s.includes('barber') || s.includes('fade') || s.includes('beard') || s.includes('haircut') || s.includes('barbing') || s.includes('grooming')) {
    return 'Barber';
  }
  if (s.includes('makeup') || s.includes('glam') || s.includes('beat') || s.includes('bridal') || s.includes('mua')) {
    return 'Makeup Artist';
  }
  if (s.includes('wig') || s.includes('frontal') || s.includes('closure') || s.includes('lace') || s.includes('revamp')) {
    return 'Wig Installer & Revamper';
  }

  // Fallback for general hair if not barber or wig
  if (s.includes('hair') && !s.includes('barber') && !s.includes('wig')) {
    return 'Hair Braider & Stylist';
  }

  return serviceIdentifier;
};

// Detect all categories that a specialist/expert provides
export const detectSpecialistCategories = (spec) => {
  if (!spec) return [];

  const rawServices = Array.isArray(spec.services)
    ? spec.services.map((s) => (typeof s === 'object' ? (s.name || s.title || s.service || '') : String(s || '')))
    : (spec.services ? String(spec.services).split(',').map((s) => s.trim()) : []);

  const rawSpecialties = Array.isArray(spec.specialties)
    ? spec.specialties.map(s => String(s || ''))
    : (spec.specialties ? String(spec.specialties).split(',').map((s) => s.trim()) : []);

  const rawPortfolio = Array.isArray(spec.portfolio)
    ? spec.portfolio.map(p => `${p?.service || ''} ${p?.title || ''} ${p?.description || ''}`)
    : [];

  const combinedText = [
    spec.title || '',
    spec.role || '',
    spec.roleTitle || '',
    spec.specialty || '',
    spec.bio || '',
    ...rawSpecialties,
    ...rawServices,
    ...rawPortfolio,
  ].join(' ').toLowerCase();

  const detected = [];

  // 1. Lash Tech
  if (
    combinedText.includes('lash') ||
    combinedText.includes('lashes') ||
    combinedText.includes('eyelash') ||
    combinedText.includes('eye aesthetic') ||
    combinedText.includes('volume set') ||
    combinedText.includes('hybrid set') ||
    combinedText.includes('classic set')
  ) {
    detected.push('Lash Tech');
  }

  // 2. Nail Tech
  if (
    combinedText.includes('nail') ||
    combinedText.includes('manicure') ||
    combinedText.includes('pedicure') ||
    combinedText.includes('acrylic') ||
    combinedText.includes('gel polish') ||
    combinedText.includes('nail art') ||
    combinedText.includes('polygel')
  ) {
    detected.push('Nail Tech');
  }

  // 3. Hair Braider & Stylist
  if (
    combinedText.includes('braid') ||
    combinedText.includes('braider') ||
    combinedText.includes('knotless') ||
    combinedText.includes('twist') ||
    combinedText.includes('locs') ||
    combinedText.includes('cornrow') ||
    combinedText.includes('box braids') ||
    (combinedText.includes('hair') && !combinedText.includes('barber') && !combinedText.includes('wig'))
  ) {
    detected.push('Hair Braider & Stylist');
  }

  // 4. Barber & Grooming
  if (
    combinedText.includes('barber') ||
    combinedText.includes('barbing') ||
    combinedText.includes('fade') ||
    combinedText.includes('fades') ||
    combinedText.includes('beard') ||
    combinedText.includes('line-up') ||
    combinedText.includes('haircut') ||
    combinedText.includes('grooming')
  ) {
    detected.push('Barber');
  }

  // 5. Makeup Artist
  if (
    combinedText.includes('makeup') ||
    combinedText.includes('mua') ||
    combinedText.includes('glam') ||
    combinedText.includes('beat') ||
    combinedText.includes('bridal beat') ||
    combinedText.includes('brow sculpting') ||
    combinedText.includes('eyebrow')
  ) {
    detected.push('Makeup Artist');
  }

  // 6. Wig Installer & Revamper
  if (
    combinedText.includes('wig') ||
    combinedText.includes('frontal') ||
    combinedText.includes('closure') ||
    combinedText.includes('lace') ||
    combinedText.includes('revamp') ||
    combinedText.includes('hot comb') ||
    combinedText.includes('ventilating')
  ) {
    detected.push('Wig Installer & Revamper');
  }

  return detected;
};

// Check if specialist matches a specific service / category
export const specialistMatchesService = (specialist, serviceTitleOrCategory) => {
  if (!serviceTitleOrCategory || serviceTitleOrCategory === 'All') return true;
  if (!specialist) return false;

  const targetCategory = getServiceCategory(serviceTitleOrCategory);
  const detected = Array.isArray(specialist.categories) && specialist.categories.length > 0
    ? specialist.categories
    : detectSpecialistCategories(specialist);

  if (detected.includes(targetCategory)) {
    return true;
  }

  // Fallback direct text match on specialist's properties
  const targetLower = targetCategory.toLowerCase();
  const specText = [
    specialist.role || '',
    specialist.title || '',
    specialist.specialty || '',
    specialist.name || '',
    ...(Array.isArray(specialist.specialties) ? specialist.specialties : []),
    ...(Array.isArray(specialist.services) ? specialist.services.map(s => (typeof s === 'object' ? (s.name || s.title) : s)) : []),
  ].join(' ').toLowerCase();

  if (targetLower.includes('lash') && specText.includes('lash')) return true;
  if (targetLower.includes('nail') && (specText.includes('nail') || specText.includes('manicure') || specText.includes('pedicure'))) return true;
  if (targetLower.includes('braid') && (specText.includes('braid') || specText.includes('twist') || specText.includes('cornrow') || specText.includes('locs'))) return true;
  if (targetLower.includes('barber') && (specText.includes('barber') || specText.includes('fade') || specText.includes('beard') || specText.includes('haircut') || specText.includes('grooming'))) return true;
  if (targetLower.includes('makeup') && (specText.includes('makeup') || specText.includes('glam') || specText.includes('beat'))) return true;
  if (targetLower.includes('wig') && (specText.includes('wig') || specText.includes('frontal') || specText.includes('lace') || specText.includes('revamp'))) return true;

  return false;
};
