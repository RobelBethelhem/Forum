import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader, // Use Card Header
  CCardBody,   // This will be scrollable
  CCardFooter, // Use Card Footer
  CCardTitle,
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CAlert,
  CBadge,
} from '@coreui/react';
// Assuming these hooks/utils are correctly set up and imported
import { useAuth } from '../../hooks/useAuth';
import API_CONFIG, { api } from '../../services/api';

const MAX_IMAGES = 3;

// Helper function (ensure it's defined or imported)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

const CreateDiscussion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Ensure useAuth provides user object { id, username } or null
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  // --- TAGS ---
  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === 'Tab') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim().toLowerCase());
    }
  };
  const addTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };
  const removeTag = (idx) => {
    setTags(prev => prev.filter((_, i) => i !== idx));
  };

  // --- IMAGES ---
  const handleFiles = (files) => {
    let fileArr = Array.from(files);
    setError(''); // Clear error on new interaction
    const currentImageCount = images.length;
    const availableSlots = MAX_IMAGES - currentImageCount;

    if (availableSlots <= 0) {
        setError(`Maximum ${MAX_IMAGES} images already selected.`);
        return;
    }

    if (fileArr.length > availableSlots) {
      setError(`You can only add ${availableSlots} more image(s). ${fileArr.length - availableSlots} file(s) were ignored.`);
      fileArr = fileArr.slice(0, availableSlots); // Take only allowed number
    }

    const imageFiles = fileArr.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length !== fileArr.length) {
        setError(prev => (prev ? prev + ' ' : '') + 'Some selected files were not valid images and were ignored.');
    }

    if (imageFiles.length > 0) {
        setImages(prev => [...prev, ...imageFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
  };
  const handleImageChange = (e) => {
    if (e.target.files?.length > 0) handleFiles(e.target.files);
  };
  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setError(''); // Clear error when making space
  };
  const triggerFileInput = () => {
    if (!loading && images.length < MAX_IMAGES) fileInputRef.current?.click();
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('tags', JSON.stringify(tags));
      images.forEach(img => formData.append('images', img));
      await api.post(API_CONFIG.ENDPOINTS.CREATE_DISCUSSION, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);
      navigate('/discussions'); // Or maybe navigate(-1) to go back
    } catch (err) {
      console.error("Error saving discussion:", err);
      setError(err.response?.data?.message || 'Failed to save discussion');
      setLoading(false);
    }
  };

  const isFormValid = title.trim() && content.trim();

  return (
    // 1. Container fills viewport height and uses flex
    <CContainer fluid className="d-flex flex-column p-0" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* 2. Row grows to fill container, centers content */}
      <CRow className="g-0 flex-grow-1 justify-content-center align-items-center py-3">
        {/* 3. Column defines width, uses flex, sets max height */}
        <CCol xs={12} md={10} lg={8} xl={7} className="d-flex flex-column" style={{ maxHeight: 'calc(100vh - 2rem)', height: '100%' /* Ensure col takes height */ }}>
          {/* 4. Card uses flex column, grows within Col, hides overflow */}
          <CCard className="shadow-lg border-0 rounded-md-4 flex-grow-1 d-flex flex-column overflow-hidden">
            {/* 5. Card Header - Fixed */}
            <CCardHeader className="bg-light border-bottom-0 py-3">
              <CCardTitle className="h5 fw-bold text-primary mb-0">
                Create New Discussion
              </CCardTitle>
            </CCardHeader>

            {/* 6. Card Body - SCROLLABLE */}
            {/*    - flex-grow-1: Takes available space */}
            {/*    - style={{ overflowY: 'auto', minHeight: 0 }}: CRITICAL for scrolling */}
            <CCardBody className="flex-grow-1 p-4" style={{ overflowY: 'auto', minHeight: 0 }}>
              <CForm onSubmit={handleSubmit} autoComplete="off" id="create-discussion-form">
                {/* --- Form Content START --- */}
                <CFormInput
                  type="text" label="Title" id="discussionTitle"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  required className="mb-3" placeholder="Enter a clear and concise title"
                  disabled={loading} maxLength={150}
                />
                <CFormTextarea
                  label="Content" id="discussionContent"
                  value={content} onChange={(e) => setContent(e.target.value)}
                  required className="mb-3" placeholder="Describe your topic, ask questions, or share ideas..."
                  rows={6} disabled={loading}
                />

                {/* Tag Input */}
                <div className="mb-3">
                  <label htmlFor="discussionTags" className="form-label fw-semibold">Tags (up to 10)</label>
                  <div className="d-flex flex-wrap gap-1 align-items-center border rounded px-2 py-1 bg-body-tertiary">
                    {tags.map((tag, idx) => (
                      <CBadge color="info" shape="rounded-pill" className="px-2 py-1 d-inline-flex align-items-center" key={`${tag}-${idx}`}>
                        {tag}
                        <CButton color="transparent" className="p-0 ms-1 text-info-emphasis lh-1 border-0" style={{ fontSize: '1.1em', cursor: 'pointer' }} onClick={() => !loading && removeTag(idx)} aria-label={`Remove tag ${tag}`} disabled={loading} size="sm">×</CButton>
                      </CBadge>
                    ))}
                    <input type="text" id="discussionTags" className="border-0 bg-transparent flex-grow-1 p-1" style={{ outline: 'none', minWidth: 150 }} value={tagInput} onChange={handleTagInput} onKeyDown={handleTagKeyDown} placeholder={tags.length === 0 ? 'Add tags (e.g., react)...' : ''} disabled={loading || tags.length >= 10} />
                  </div>
                  <div className="form-text">Press Enter, comma, or Tab to add a tag.</div>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Images (optional, max {MAX_IMAGES})</label>
                  <div
                    className={`drag-drop-zone rounded p-3 text-center border ${dragActive ? 'border-primary bg-primary-subtle' : 'border-dashed'} ${loading || images.length >= MAX_IMAGES ? 'disabled' : ''}`}
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                    style={{ cursor: (loading || images.length >= MAX_IMAGES) ? 'not-allowed' : 'pointer', minHeight: 100, transition: 'background-color 0.2s ease, border-color 0.2s ease', opacity: (loading || images.length >= MAX_IMAGES) ? 0.7 : 1 }}
                    onClick={triggerFileInput} role="button" aria-label={`Upload images, maximum ${MAX_IMAGES}`}
                    tabIndex={(loading || images.length >= MAX_IMAGES) ? -1 : 0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && !e.target.closest('button') && triggerFileInput()} // Prevent button inside from triggering outer keydown
                  >
                    <input type="file" accept="image/png, image/jpeg, image/gif, image/webp" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageChange} disabled={loading || images.length >= MAX_IMAGES} />
                    <div className="mb-2"><i className={`bi bi-cloud-arrow-up fs-2 ${dragActive ? 'text-primary' : 'text-secondary'}`}></i></div>
                    <div className="fw-semibold text-secondary small">
                      {images.length < MAX_IMAGES ? (<>Drag & Drop or Click to upload <br /> ({MAX_IMAGES - images.length} remaining)</>) : (<>Maximum {MAX_IMAGES} images uploaded</>)}
                    </div>
                  </div>
                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="d-flex flex-wrap mt-2 gap-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="position-relative image-preview-container">
                          <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #dee2e6' }} />
                          <CButton
                            color="danger" size="sm" className="position-absolute top-0 end-0 p-0 lh-1 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '22px', height: '22px', transform: 'translate(30%, -30%)', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }} // Stop propagation needed here too
                            disabled={loading} aria-label={`Remove image ${idx + 1}`}
                          >
                            <i className="bi bi-x" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}></i>
                          </CButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                 <CCardFooter className="bg-light d-flex justify-content-end gap-2 py-3">
              <CButton color="secondary" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" form="create-discussion-form" disabled={loading || !isFormValid}>
                {loading ? 'Saving...' : 'Create Discussion'}
              </CButton>
            </CCardFooter>

                {/* Error Alert */}
                {error && <CAlert color="danger" className="mt-3 mb-0">{error}</CAlert>}
                {/* --- Form Content END --- */}
              </CForm>
            </CCardBody>

            {/* 7. Card Footer - Fixed */}
            <CCardFooter className="bg-light d-flex justify-content-end gap-2 py-3" style={{ visibility: 'hidden' }}>
              <CButton color="secondary" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" form="create-discussion-form" disabled={loading || !isFormValid}>
                {loading ? 'Saving...' : 'Create Discussion'}
              </CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default CreateDiscussion;