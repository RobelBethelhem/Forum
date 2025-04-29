import React, { useState, useEffect } from 'react';
import { getTestimonies } from '../services/testimonies';
import API_CONFIG from '../services/api';
import StarRating from '../components/ui/StarRating';

export default function Testimonies() {
  const [testimonies, setTestimonies] = useState([]);
  const [fullscreenImg, setFullscreenImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getTestimonies()
      .then(data => setTestimonies(data))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <h2 className="fw-bold text-primary text-center mb-4">What Our Users Say</h2>
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="row justify-content-center g-4">
          {testimonies.map((t, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i}>
              <div className="card shadow-lg border-0 rounded-4 h-100 p-4 testimony-card">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-circle me-3" style={{ width: 46, height: 46, fontSize: '1.2em' }}>
                    {t.User.username.split(' ').length > 1 ? (t.User.username[0] + t.User.username.split(' ')[1][0]).toUpperCase() : t.User.username.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-semibold text-primary">{t.User.username}</div>
                    <div className="text-muted small">{t.date}</div>
                  </div>
                </div>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  {(() => {
                    let imgs = [];
                    if (Array.isArray(t.images)) imgs = t.images;
                    else if (typeof t.images === 'string') {
                      try { imgs = JSON.parse(t.images); } catch { imgs = []; }
                    }
                    return imgs.map((img, idx) => {
                      const src = img.startsWith('http') ? img : `${API_CONFIG.BASE_URL}${img}`;
                      return (
                        <img
                          key={idx}
                          src={src}
                          alt="Testimony"
                          onClick={() => setFullscreenImg(src)}
                          style={{ cursor: 'pointer', width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                      );
                    });
                  })()}
                </div>
                {/* Star rating */}
                <div className="mb-3">
                  <StarRating rating={t.rating} max={5} />
                </div>
                {/* Testimony text */}
                <div className="mb-3" style={{ minHeight: 72 }}>
                  <span className="text-secondary">"{t.text}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {fullscreenImg && (
        <div className="fullscreen-img-modal" onClick={(e) => {
          if (e.target.classList.contains('fullscreen-img-modal')) {
            setFullscreenImg(null);
          }
        }}>
          <img
            src={fullscreenImg.startsWith('http') ? fullscreenImg : `${API_CONFIG.BASE_URL}${fullscreenImg}`}
            alt="Full testimony"
            className="fullscreen-img"
            style={{ maxWidth: '90%', maxHeight: '90%' }}
          />
          <button className="fullscreen-img-close" onClick={() => setFullscreenImg(null)}>&times;</button>
        </div>
      )}
    </div>
  );
}
