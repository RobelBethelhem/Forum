import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CContainer, CForm, CFormTextarea, CFormInput, CFormLabel, CButton, CAlert } from '@coreui/react';
import { useAuthContext } from '../context/AuthContext';
import { createTestimony } from '../services/testimonies';
import StarRating from '../components/ui/StarRating';

export default function CreateTestimony() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // Image previews
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  // Drag & drop file upload refs and handlers
  const fileInputRef = useRef(null);
  const handleFileSelect = (e) => setImages(prev => [...prev, ...Array.from(e.target.files)]);
  const handleDrop = (e) => {
    e.preventDefault();
    setImages(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  if (!user) {
    return (
      <CContainer className="py-4">
        <CAlert color="danger">You must be logged in to create a testimony.</CAlert>
      </CContainer>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!text.trim() || !date || !rating) {
      setError('All fields are required.');
      return;
    }
    const formData = new FormData();
    formData.append('text', text);
    formData.append('date', date);
    formData.append('rating', rating);
    images.forEach((img) => formData.append('images', img));

    try {
      setLoading(true);
      await createTestimony(formData);
      setSuccess('Testimony created successfully.');
      setText('');
      setDate('');
      setRating(5);
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create testimony.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer className="py-4" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <h2 className="fw-bold text-primary mb-4">Create Testimony</h2>
      {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-3">{success}</CAlert>}
      <CForm onSubmit={handleSubmit}>
        <CFormLabel>Text</CFormLabel>
        <CFormTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mb-3"
        />
        <CFormLabel>Date</CFormLabel>
        <CFormInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-3"
        />
        <CFormLabel>Rating</CFormLabel>
        <div className="mb-3">
          <StarRating
            rating={rating}
            max={5}
            interactive
            onRatingChange={val => setRating(val)}
          />
        </div>
        <CFormLabel>Images</CFormLabel>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className="mb-3"
          style={{ border: '2px dashed #ced4da', padding: '1rem', borderRadius: '4px', textAlign: 'center', cursor: 'pointer' }}
        >
          {images.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {previews.map((src, idx) => (
                <img key={idx} src={src} alt={images[idx].name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }} />
              ))}
            </div>
          ) : (
            'Drag & drop images here, or click to select'
          )}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
        <div className="d-flex justify-content-end">
          <CButton color="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </CButton>
        </div>
      </CForm>
    </CContainer>
  );
}
