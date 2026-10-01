import React from 'react';
import { MapPin, Building, Home, Navigation } from 'lucide-react';
import { SUPPORTED_STATES } from '../../utils/locations';

export const NIGERIAN_STATES = SUPPORTED_STATES;


export const LocationSelector = ({ location, onChange }) => {
  const selectedStateObj = NIGERIAN_STATES.find(s => s.name === location.state) || NIGERIAN_STATES.find(s => s.name === 'Lagos') || NIGERIAN_STATES[0];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', width: '100%' }}>
        {/* State Select */}
        <div className="app-input-group" style={{ marginBottom: 0, minWidth: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <MapPin size={13} color="var(--color-accent)" /> State *
          </label>
          <select
            value={location.state || 'Lagos'}
            onChange={handleStateChange}
            className="app-select"
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          >
            {NIGERIAN_STATES.map(st => (
              <option key={st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Local Government Area (LGA) Select */}
        <div className="app-input-group" style={{ marginBottom: 0, minWidth: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <Building size={13} color="var(--color-accent)" /> LGA / District *
          </label>
          <select
            value={location.lga || selectedStateObj.lgas[0]}
            onChange={(e) => onChange({ ...location, lga: e.target.value })}
            className="app-select"
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', width: '100%' }}>
        <div className="app-input-group" style={{ marginBottom: 0, minWidth: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <Navigation size={13} color="#d4af37" /> Street Name *
          </label>
          <input
            type="text"
            value={location.street || ''}
            onChange={(e) => onChange({ ...location, street: e.target.value })}
            placeholder="e.g. Allen Avenue"
            className="app-input"
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div className="app-input-group" style={{ marginBottom: 0, minWidth: 0 }}>
          <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <Home size={13} color="#d4af37" /> House/Flat # *
          </label>
          <input
            type="text"
            value={location.houseNumber || ''}
            onChange={(e) => onChange({ ...location, houseNumber: e.target.value })}
            placeholder="e.g. 23"
            className="app-input"
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
