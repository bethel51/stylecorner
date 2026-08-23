import React from 'react';
import { MapPin, Building, Home, Navigation } from 'lucide-react';

export const NIGERIAN_STATES = [
  {
    name: 'Lagos',
    lgas: ['Ikeja', 'Lagos Island', 'Lagos Mainland', 'Surulere', 'Eti-Osa (Lekki/VI)', 'Alimosho', 'Ikorodu', 'Kosofe', 'Oshodi-Isolo', 'Amuwo-Odofin']
  },
  {
    name: 'Abuja (FCT)',
    lgas: ['Abuja Municipal (AMAC)', 'Gwagwalada', 'Kuje', 'Bwari', 'Abaji', 'Kwali']
  },
  {
    name: 'Rivers',
    lgas: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Oyigbo', 'Ikwerre', 'Okrika']
  },
  {
    name: 'Oyo',
    lgas: ['Ibadan North', 'Ibadan South-West', 'Ibadan North-East', 'Oyo East', 'Ogbomoso North']
  },
  {
    name: 'Ogun',
    lgas: ['Abeokuta South', 'Abeokuta North', 'Ifo', 'Odeda', 'Sagamu', 'Ijebu Ode']
  },
  {
    name: 'Kano',
    lgas: ['Kano Municipal', 'Dala', 'Fagge', 'Gwale', 'Nasarawa', 'Tarauni']
  },
  {
    name: 'Delta',
    lgas: ['Warri South', 'Asaba (Oshimili South)', 'Uvwie', 'Ughelli North']
  },
  {
    name: 'Enugu',
    lgas: ['Enugu North', 'Enugu South', 'Enugu East', 'Nsukka']
  },
  {
    name: 'Edo',
    lgas: ['Oredo (Benin City)', 'Ikpoba-Okha', 'Egor', 'Uromi']
  },
  {
    name: 'Kaduna',
    lgas: ['Kaduna North', 'Kaduna South', 'Chikun', 'Zaria']
  },
  {
    name: 'Other State',
    lgas: ['Central LGA', 'Urban LGA', 'North LGA', 'South LGA', 'Other LGA']
  }
];

export const LocationSelector = ({ location, onChange }) => {
  const selectedStateObj = NIGERIAN_STATES.find(s => s.name === location.state) || NIGERIAN_STATES[0];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const stateObj = NIGERIAN_STATES.find(s => s.name === newState) || NIGERIAN_STATES[0];
    onChange({
      ...location,
      state: newState,
      lga: stateObj.lgas[0] || ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* State */}
        <div className="app-input-group" style={{ marginBottom: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={13} color="#d4af37" /> State *
          </label>
          <select
            value={location.state || NIGERIAN_STATES[0].name}
            onChange={handleStateChange}
            className="app-input"
            required
            style={{ appearance: 'auto', background: '#ffffff' }}
          >
            {NIGERIAN_STATES.map(st => (
              <option key={st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Local Government Area (LGA) */}
        <div className="app-input-group" style={{ marginBottom: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building size={13} color="#d4af37" /> LGA / District *
          </label>
          <select
            value={location.lga || selectedStateObj.lgas[0]}
            onChange={(e) => onChange({ ...location, lga: e.target.value })}
            className="app-input"
            required
            style={{ appearance: 'auto', background: '#ffffff' }}
          >
            {selectedStateObj.lgas.map(lga => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Street Name & House Number */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
        <div className="app-input-group" style={{ marginBottom: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={13} color="#d4af37" /> Street Name *
          </label>
          <input
            type="text"
            value={location.street}
            onChange={(e) => onChange({ ...location, street: e.target.value })}
            placeholder="e.g. Allen Avenue, VI"
            className="app-input"
            required
          />
        </div>

        <div className="app-input-group" style={{ marginBottom: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Home size={13} color="#d4af37" /> House/Flat # *
          </label>
          <input
            type="text"
            value={location.houseNumber}
            onChange={(e) => onChange({ ...location, houseNumber: e.target.value })}
            placeholder="e.g. No. 12"
            className="app-input"
            required
          />
        </div>
      </div>
    </div>
  );
};
