import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import API_CONFIG, { api } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

function getAvatarInitials(username) {
  if (!username) return '';
  const parts = username.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  // Ensure server/uploads prefix
  if (imagePath.startsWith('uploads/')) return `https://base.movacash.com/${imagePath}`;
  if (imagePath.startsWith('/uploads/')) return `https://base.movacash.com${imagePath}`;
  return `https://base.movacash.com/uploads/${imagePath}`;
}

const DiscussionCard = ({ discussion }) => {
  const { user, token } = useAuthContext();
  // Defensive: upvotes may be undefined/null
  const upvotes = Array.isArray(discussion.upvotes) ? discussion.upvotes : [];
  const [liked, setLiked] = useState(!!discussion.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(
    typeof discussion.likeCount === 'number'
      ? discussion.likeCount
      : upvotes.length
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const author = discussion.User || discussion.user || discussion.author || { username: 'Unknown' };
  // Defensive: images may be array, stringified array, or single string
  let images = [];
  if (Array.isArray(discussion.images)) {
    images = discussion.images;
  } else if (typeof discussion.images === 'string' && discussion.images.trim().length > 0) {
    try {
      const parsed = JSON.parse(discussion.images);
      images = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      images = [discussion.images];
    }
  }
  const handleLike = async (e) => {
    e.stopPropagation();
    if (likeLoading || liked || !user) return;
    setLikeLoading(true);
    try {
      await api.post(
        API_CONFIG.ENDPOINTS.LIKE_DISCUSSION(discussion.id || discussion._id),
        {},
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(true);
      setLikeCount(likeCount + 1);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('You must be logged in to like a discussion.');
      } else if (err.response?.data?.message === 'Already liked.') {
        setLiked(true);
      } else {
        alert(err.response?.data?.message || 'Failed to like discussion.');
      }
    }
    setLikeLoading(false);
  };

  return (
    <Link to={`/discussions/${discussion._id || discussion.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <li className="discussion-card" style={{ listStyle: 'none', marginBottom: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(60,60,60,0.07)', padding: 20, cursor: 'pointer' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, fontSize: 18, fontWeight: 'bold' }}>
            {getAvatarInitials(author.username)}
          </div>
          <div>
            <div className="fw-semibold">{author.username}</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>{formatDate(discussion.createdAt)}</div>
          </div>
        </div>
        {images.length > 0 && images[0] && (
          <div className="discussion-thumbnail" style={{ margin: '10px 0' }}>
            <img src={getImageUrl(images[0])} alt="thumbnail" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'cover' }} />
          </div>
        )}
        <div className="mb-2">
          <div className="fw-bold fs-5 mb-1">{discussion.title}</div>
          <div className="text-secondary mb-2" style={{ fontSize: 15, minHeight: 36 }}>{discussion.content?.slice(0, 120)}{discussion.content?.length > 120 ? '...' : ''}</div>
          <div className="mb-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Array.isArray(discussion.tags) ? discussion.tags : (typeof discussion.tags === 'string' && discussion.tags ? JSON.parse(discussion.tags) : [])).map((tag, idx) => (
              <span key={tag + idx} className="badge bg-info text-dark" style={{ fontSize: 13, fontWeight: 500, marginRight: 4, marginBottom: 2 }}>{tag}</span>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-sm text-base-content/70 align-items-center">
            <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike} aria-label="Like" disabled={liked || likeLoading || !user}>
              <svg height="22" width="22" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={liked ? '#1877f2' : '#b0b0b0'} stroke="#fff" strokeWidth="0.2"/>
              </svg>
              <span style={{ fontWeight: 600, color: liked ? '#1877f2' : '#555' }}>{likeCount}</span>
            </button>
          </div>
        </div>
      </li>
    </Link>
  );
};

export default DiscussionCard;
