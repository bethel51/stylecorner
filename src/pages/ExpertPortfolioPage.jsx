import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Tag,
  Eye,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';

const portfolioServices = [
  'All',
  'Hair Braiding & Locs',
  'Precision Barbering & Fades',
  'Silk Lash Extensions',
  'Gel & Acrylic Nail Art',
  'Bridal & Event Makeup',
  'Lace Frontal & Wig Revamp',
  'Skincare & Facial Aesthetics',
  'Pedicure & Foot Reflexology',
];

export const ExpertPortfolioPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [portfolio, setPortfolio] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [workForm, setWorkForm] = useState({
    title: '',
    service: 'Hair Braiding & Locs',
    duration: '',
    price: '',
    clientNote: '',
    imageFile: null,
    imagePreview: null,
  });

  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      if (Array.isArray(data)) setPortfolio(data);
    } catch (e) {
      console.error('Error fetching portfolio:', e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleWorkImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setWorkForm((p) => ({ ...p, imageFile: file, imagePreview: previewUrl }));
  };

  const handleSaveWorkLog = async (e) => {
    e.preventDefault();
    if (!workForm.imageFile) {
      showToast('Please select a photo of your client work.', 'error');
      return;
    }
    if (!workForm.title.trim()) {
      showToast('Please enter a title for this hairstyle or service.', 'error');
      return;
    }

    setUploadingPortfolio(true);
    try {
      const imageUrl = await uploadToCloudinary(workForm.imageFile);
      const newEntry = {
        title: workForm.title.trim(),
        service: workForm.service,
        duration: workForm.duration.trim(),
        price: workForm.price.trim(),
        clientNote: workForm.clientNote.trim(),
        imageUrl,
      };

      await api.addPortfolioItem(newEntry);
      showToast('Work logged and published to your lookbook showcase!', 'success');

      setWorkForm({
        title: '',
        service: 'Hair Braiding & Locs',
        duration: '',
        price: '',
        clientNote: '',
        imageFile: null,
        imagePreview: null,
      });
      setShowAddForm(false);
      fetchPortfolio();
    } catch (err) {
      showToast(err.message || 'Failed to save portfolio work', 'error');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to remove this lookbook transformation?')) return;
    setDeletingId(id);
    try {
      await api.deletePortfolioItem(id);
      setPortfolio((prev) => prev.filter((item) => (item._id || item.id) !== id));
      showToast('Transformation removed from lookbook.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete lookbook entry', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPortfolio = selectedCategory === 'All'
    ? portfolio
    : portfolio.filter((item) => (item.service || 'General') === selectedCategory);

  return (
    <PageContainer showBack={false}>
      <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '4rem' }}>

        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <button
            onClick={() => navigate('/expert-dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.55rem 0.95rem',
              color: '#e2e8f0',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: showAddForm ? 'rgba(255, 255, 255, 0.1)' : '#f5b942',
              color: showAddForm ? '#ffffff' : '#0c0e14',
              border: 'none',
              borderRadius: '12px',
              padding: '0.55rem 1rem',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: showAddForm ? 'none' : '0 4px 14px rgba(245, 185, 66, 0.3)',
            }}
          >
            {showAddForm ? <X size={15} /> : <Plus size={15} />}
            {showAddForm ? 'Cancel Entry' : 'Log New Work'}
          </button>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f5b942', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <BookOpen size={13} /> Visual Proof & Lookbook Showcase
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Portfolio Work & Logbook
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Document client hairstyles, beauty transformations, styling durations, and techniques published directly to your public lookbook.
          </p>
        </div>

        {/* Add Work Form Section */}
        {showAddForm && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.08) 0%, #151824 35%, #0f121a 100%)',
              border: '1.5px solid rgba(245, 185, 66, 0.35)',
              borderRadius: '24px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#f5b942" />
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Log Client Transformation
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#f5b942', fontWeight: 700, fontFamily: 'Outfit' }}>
                Publishes to Public Lookbook
              </span>
            </div>

            <form onSubmit={handleSaveWorkLog} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Photo Area */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Client Work Photo <span style={{ color: '#ef4444' }}>*</span>
                </label>

                {workForm.imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <img
                      src={workForm.imagePreview}
                      alt="Work preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(12, 14, 20, 0.85)',
                        backdropFilter: 'blur(6px)',
                        color: '#f5b942',
                        border: '1px solid rgba(245, 185, 66, 0.35)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '50px',
                        fontSize: '0.76rem',
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Camera size={13} /> Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleWorkImageSelect}
                        style={{ display: 'none' }}
                        disabled={uploadingPortfolio}
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: '16px',
                      border: '2px dashed rgba(245, 185, 66, 0.35)',
                      background: 'rgba(245, 185, 66, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      gap: '0.5rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                      <Camera size={22} />
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#f5b942' }}>
                      Upload Client Result Photo
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      PNG, JPG, WEBP up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWorkImageSelect}
                      style={{ display: 'none' }}
                      disabled={uploadingPortfolio}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Transformation Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bohemian Knotless Braids, Razor Fade & Beard Sculpt"
                  value={workForm.title}
                  onChange={(e) => setWorkForm((p) => ({ ...p, title: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#0e111a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#ffffff',
                    fontFamily: 'Outfit',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />

                {/* Quick Suggestion Chips */}
                <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', marginTop: '0.5rem', scrollbarWidth: 'none' }}>
                  {['Silk Press & Steam', 'Skin Fade + Beard', 'Knotless Braids', 'Russian Almond Gel', 'Soft Glam Makeup'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setWorkForm((p) => ({ ...p, title: chip }))}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Service Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={workForm.service}
                  onChange={(e) => setWorkForm((p) => ({ ...p, service: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#0e111a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#ffffff',
                    fontFamily: 'Outfit',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {portfolioServices.filter((s) => s !== 'All').map((svc) => (
                    <option key={svc} value={svc} style={{ background: '#151822', color: '#ffffff' }}>
                      {svc}
                    </option>
                  ))}
                  <option value="General" style={{ background: '#151822', color: '#ffffff' }}>
                    General / Bespoke Styling
                  </option>
                </select>
              </div>

              {/* Row: Duration & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hrs, 45 mins"
                    value={workForm.duration}
                    onChange={(e) => setWorkForm((p) => ({ ...p, duration: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#0e111a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '0.8rem 1rem',
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Fee / Value (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₦25,000"
                    value={workForm.price}
                    onChange={(e) => setWorkForm((p) => ({ ...p, price: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#0e111a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '0.8rem 1rem',
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Client & Technique Notes */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Technique, Products & Client Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Scalp prep with botanical butter, straight razor finish. Client requested mid-back length with curly blonde ends."
                  value={workForm.clientNote}
                  onChange={(e) => setWorkForm((p) => ({ ...p, clientNote: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#0e111a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: '#ffffff',
                    fontFamily: 'Outfit',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    lineHeight: 1.4,
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploadingPortfolio}
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                  color: '#0c0e14',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: uploadingPortfolio ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(245, 185, 66, 0.3)',
                }}
              >
                {uploadingPortfolio ? (
                  <>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(12,14,20,0.3)', borderTopColor: '#0c0e14', animation: 'spin 0.7s linear infinite' }} />
                    <span>Uploading & Publishing Work…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Save & Publish to Lookbook
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
          {portfolioServices.map((cat) => {
            const active = selectedCategory === cat;
            const count = cat === 'All' ? portfolio.length : portfolio.filter((i) => i.service === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: active ? '#f5b942' : '#151824',
                  color: active ? '#0c0e14' : '#94a3b8',
                  border: active ? '1px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50px',
                  padding: '0.4rem 0.95rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Portfolio Grid */}
        {filteredPortfolio.length === 0 ? (
          <div
            style={{
              background: '#151824',
              borderRadius: '22px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#f5b942' }}>
              <BookOpen size={32} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
              No lookbook transformations logged
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Showcase your talent and artistic techniques by documenting client styling sessions.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: '#f5b942',
                color: '#0c0e14',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '50px',
                fontFamily: 'Outfit',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Plus size={16} /> Log First Transformation
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredPortfolio.map((item, idx) => {
              const itemId = item._id || item.id || idx;
              const img = item.imageUrl || item.url;

              return (
                <div
                  key={itemId}
                  style={{
                    background: '#151824',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.4)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', width: '100%', height: '180px', background: '#0e111a' }}>
                    <img
                      src={img}
                      alt={item.title || 'Client work'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(12, 14, 20, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '50px',
                        fontSize: '0.68rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        color: '#f5b942',
                        border: '1px solid rgba(245, 185, 66, 0.3)',
                      }}
                    >
                      {item.service || 'Specialist Styling'}
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(itemId)}
                      disabled={deletingId === itemId}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.85)',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: deletingId === itemId ? 'not-allowed' : 'pointer',
                      }}
                      title="Delete lookbook entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.45rem' }}>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {item.title || 'Client Work'}
                    </h4>

                    {(item.duration || item.price) && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {item.duration && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} color="#f5b942" /> {item.duration}
                          </span>
                        )}
                        {item.price && (
                          <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: '#f5b942', fontSize: '0.88rem' }}>
                            {item.price.startsWith('₦') ? item.price : `₦${item.price}`}
                          </span>
                        )}
                      </div>
                    )}

                    {(item.clientNote || item.description) && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                        "{item.clientNote || item.description}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default ExpertPortfolioPage;
