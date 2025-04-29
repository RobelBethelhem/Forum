import React, { useEffect, useState, useRef } from 'react';
import API_CONFIG, { api } from '../services/api';
import { Link } from 'react-router-dom';
import DiscussionCard from '../components/discussion/DiscussionCard';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CButton, CSpinner, CAlert, CBadge, CFormInput
} from '@coreui/react';

// Helper to parse tags from all discussions
function extractTags(discussions) {
  const tagSet = new Set();
  discussions.forEach(discussion => {
    let tags = [];
    if (Array.isArray(discussion.tags)) {
      tags = discussion.tags;
    } else if (typeof discussion.tags === 'string' && discussion.tags.trim().length > 0) {
      try {
        const parsed = JSON.parse(discussion.tags);
        tags = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        tags = [discussion.tags];
      }
    }
    tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet);
}

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(API_CONFIG.ENDPOINTS.GET_DISCUSSIONS || '/api/discussions');
        setDiscussions(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load discussions');
      }
      setLoading(false);
    };
    fetchDiscussions();
  }, []);

  // Filter discussions by selected tags
  const allTags = extractTags(discussions);
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(tag)
  );

  let filtered = selectedTags.length > 0
    ? discussions.filter(discussion => {
        let tags = [];
        if (Array.isArray(discussion.tags)) {
          tags = discussion.tags;
        } else if (typeof discussion.tags === 'string' && discussion.tags.trim().length > 0) {
          try {
            const parsed = JSON.parse(discussion.tags);
            tags = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            tags = [discussion.tags];
          }
        }
        return selectedTags.every(tag => tags.includes(tag));
      })
    : discussions;

  // Filter, search, and sort discussions
  filtered = filtered.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.content.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === 'newest') {
    filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    filtered = filtered.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'mostUpvoted') {
    filtered = filtered.slice().sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
  }

  // Handle tag input focus/blur
  useEffect(() => {
    function handleClickOutside(e) {
      if (tagInputRef.current && !tagInputRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tag input handlers
  const handleTagSelect = tag => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
    // Refocus input so user can keep typing
    setTimeout(() => {
      if (tagInputRef.current) tagInputRef.current.focus();
    }, 0);
  };
  const handleTagRemove = tag => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  if (loading) return (
    <div className="d-flex justify-content-center my-5">
      <CSpinner color="primary" size="lg" />
    </div>
  );
  if (error) return (
    <CAlert color="danger" className="text-center">{error}</CAlert>
  );

  return (
    <CContainer className="py-4" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <CRow className="mb-4">
        <CCol xs={12} className="text-center">
          <h2 className="fw-bold display-6 text-primary">Latest Discussions</h2>
        </CCol>
      </CRow>
      <CRow className="mb-3 justify-content-between align-items-end g-2">
        <CCol xs={12} md={4}>
          <CFormInput
            type="text"
            placeholder="Search discussions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="shadow-sm"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="form-select shadow-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostUpvoted">Most Upvoted</option>
          </select>
        </CCol>
        <CCol xs={12} md={5}>
          <div className="mb-3 position-relative" style={{ minHeight: 44, background: '#f4f6fa', borderRadius: 8, padding: 7, border: '1px solid #e3e8ee', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            {(selectedTags || []).map(tag => (
              <span key={tag} style={{
                background: '#e1ecf4',
                color: '#39739d',
                border: '1px solid #bcdff1',
                borderRadius: 16,
                padding: '4px 12px',
                margin: '2px 4px 2px 0',
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                fontWeight: 500,
                cursor: 'default',
                boxShadow: '0 1px 2px rgba(60,60,60,0.02)',
                whiteSpace: 'nowrap'
              }}>
                {tag}
                <span
                  style={{ marginLeft: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 17, color: '#39739d', opacity: 0.7 }}
                  aria-label="Remove tag"
                  onClick={() => handleTagRemove(tag)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleTagRemove(tag); }}
                >×</span>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => {
                setTagInput(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              ref={tagInputRef}
              placeholder={(selectedTags || []).length === 0 ? "Add tags..." : "Add more..."}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                minWidth: 120,
                fontSize: 15,
                padding: '4px 0',
                flex: 1,
                marginLeft: 2,
                display: 'inline-block'
              }}
              autoComplete="off"
              onKeyDown={e => {
                if (e.key === 'Backspace' && tagInput === '' && (selectedTags || []).length > 0) {
                  setSelectedTags((selectedTags || []).slice(0, -1));
                }
              }}
            />
            {showTagDropdown && filteredTags.length > 0 && (
              <div className="autocomplete-dropdown-list shadow" style={{ position: 'absolute', left: 6, top: 42, background: '#fff', border: '1px solid #ddd', zIndex: 10, minWidth: 180, borderRadius: 6, maxHeight: 180, overflowY: 'auto', boxShadow: '0 2px 8px rgba(60,60,60,0.09)' }}>
                {filteredTags.map(tag => (
                  <div
                    key={tag}
                    className="autocomplete-item"
                    style={{ cursor: 'pointer', padding: '7px 16px', fontSize: 15, color: '#39739d', fontWeight: 500 }}
                    onMouseDown={e => { e.preventDefault(); handleTagSelect(tag); }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
            {(selectedTags || []).length > 0 && (
              <button className="btn btn-link ms-2 py-0 px-1" style={{ fontSize: 14, verticalAlign: 'middle', color: '#39739d' }} onClick={() => setSelectedTags([])}>Clear</button>
            )}
          </div>
        </CCol>
        <CCol xs={12} md={2} className="text-end">
          <Link to="/discussions/create">
            <CButton color="primary" className="px-4">New Discussion</CButton>
          </Link>
        </CCol>
      </CRow>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-base-content">No discussions yet. Be the first to <Link to="/discussions/create" className="link link-primary">start a discussion</Link>!</div>
      ) : (
        <CRow className="g-4">
          {filtered.map((discussion) => (
            <CCol key={discussion.id || discussion._id || (discussion.title + Math.random())} xs={12} md={6} lg={4}>
              <DiscussionCard discussion={discussion} />
            </CCol>
          ))}
        </CRow>
      )}
    </CContainer>
  );
};

export default Discussions;
