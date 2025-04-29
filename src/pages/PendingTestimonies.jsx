import React, { useEffect, useState } from 'react';
import { CContainer, CCard, CCardBody, CCardTitle, CCardText, CButton, CAlert, CSpinner } from '@coreui/react';
import { useAuthContext } from '../context/AuthContext';
import { getPendingTestimonies, approveTestimony, rejectTestimony } from '../services/testimonies';

export default function PendingTestimonies() {
  const { user } = useAuthContext();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPending();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingTestimonies();
      setPending(data);
    } catch (err) {
      setError('Failed to fetch pending testimonies.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionMessage('');
    try {
      await approveTestimony(id);
      setActionMessage('Testimony approved!');
      setPending(pending.filter(t => t.id !== id));
    } catch {
      setActionMessage('Failed to approve testimony.');
    }
  };

  const handleReject = async (id) => {
    setActionMessage('');
    try {
      await rejectTestimony(id);
      setActionMessage('Testimony rejected.');
      setPending(pending.filter(t => t.id !== id));
    } catch {
      setActionMessage('Failed to reject testimony.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    if (imagePath.startsWith('uploads/')) return `https://base.movacash.com/${imagePath}`;
    if (imagePath.startsWith('/uploads/')) return `https://base.movacash.com${imagePath}`;
    return `https://base.movacash.com/uploads/${imagePath}`;
  };

  if (!user || user.role !== 'admin') {
    return (
      <CContainer className="py-4">
        <CAlert color="danger">Access denied. Admins only.</CAlert>
      </CContainer>
    );
  }

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold text-danger mb-4">Pending Testimonies</h2>
      {error && <CAlert color="danger">{error}</CAlert>}
      {actionMessage && <CAlert color="info">{actionMessage}</CAlert>}
      {loading ? (
        <div className="text-center my-5"><CSpinner color="primary" /></div>
      ) : pending.length === 0 ? (
        <CAlert color="success">No pending testimonies!</CAlert>
      ) : (
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
          {pending.map(testimony => {
            let imagesArr = [];
            if (Array.isArray(testimony.images)) {
              imagesArr = testimony.images;
            } else if (typeof testimony.images === 'string') {
              try {
                imagesArr = JSON.parse(testimony.images);
                if (!Array.isArray(imagesArr)) imagesArr = [];
              } catch {
                imagesArr = [];
              }
            }
            return (
              <CCard className="mb-3 shadow-sm" key={testimony.id}>
                <CCardBody>
                  <CCardTitle className="fw-bold mb-2">{testimony.text.slice(0, 40)}...</CCardTitle>
                  <CCardText><span className="text-muted">By: </span>{testimony.User?.username || 'Unknown'}</CCardText>
                  <CCardText><span className="text-muted">Date: </span>{testimony.date}</CCardText>
                  <CCardText><span className="text-muted">Rating: </span>{testimony.rating}</CCardText>
                  {imagesArr.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-3 justify-content-start align-items-center">
                      {imagesArr.map((img, idx) => (
                        <img
                          key={idx}
                          src={getImageUrl(img)}
                          alt={`Testimony image ${idx + 1}`}
                          style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}
                          className="img-fluid"
                        />
                      ))}
                    </div>
                  )}
                  <div className="d-flex gap-2 mt-2">
                    <CButton color="success" size="sm" onClick={() => handleApprove(testimony.id)}>Approve</CButton>
                    <CButton color="danger" size="sm" onClick={() => handleReject(testimony.id)}>Reject</CButton>
                  </div>
                </CCardBody>
              </CCard>
            );
          })}
        </div>
      )}
    </CContainer>
  );
}
