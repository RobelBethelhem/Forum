import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText, CBadge, CButton, CForm, CFormTextarea, CAlert } from '@coreui/react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getDiscussion } from '../../services/discussions';
import { formatRelativeDate } from '../../utils/helpers';
import API_CONFIG, { api } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('uploads/')) return `https://base.movacash.com/${imagePath}`;
  if (imagePath.startsWith('/uploads/')) return `https://base.movacash.com${imagePath}`;
  return `https://base.movacash.com/uploads/${imagePath}`;
}

// Avatar initials helper (for Facebook-like UI)
const getAvatarInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
};

function ReplyItem({ reply, parentId, onLikeReply, onReplyToReply, userVotes }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const userVote = userVotes[`reply-${parentId}-${reply.id}`];
  const likeCount = reply.Likes?.length ?? 0;
  const replyCount = reply.replies?.length ?? 0;
  const liked = userVote === 'like';

  return (
    <div style={{ display: 'flex', marginBottom: 16 }}>
      <div style={{ marginRight: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
          {getAvatarInitials(reply.User?.username)}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, marginRight: 8 }}>{reply.User?.username || 'Unknown'}</span>
          <span style={{ color: '#65676B', fontSize: 12 }}>{formatRelativeDate(reply.createdAt)}</span>
        </div>
        <div style={{ marginBottom: 8 }}>{reply.content}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
          <button onClick={() => onLikeReply(parentId, reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: liked ? 'green' : '#65676B' }}>
            <i className={`bi ${liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`} />
            <span style={{ marginLeft: 4 }}>{likeCount}</span>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplyInput(v => !v)}>Reply</button>
        </div>
        {/* Reply input toggled by Reply button */}
        {showReplyInput && (
          <div style={{ marginBottom: 16 }}>
            <CFormTextarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply..."
              className="mb-2"
            />
            <CButton size="sm" color="primary" className="me-2" onClick={() => { onReplyToReply(parentId, reply.id, replyText); setReplyText(''); setShowReplyInput(false); }}>Send</CButton>
            <CButton size="sm" color="secondary" variant="outline" onClick={() => setShowReplyInput(false)}>Cancel</CButton>
          </div>
        )}
        {/* TikTok-style View Replies */}
        {replyCount > 0 && !showReplies && (
          <div style={{ marginLeft: 40, marginBottom: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplies(true)}>View {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</button>
          </div>
        )}
        {showReplies && reply.replies?.length > 0 && (
          <div style={{ marginLeft: 40, marginBottom: 16 }}>
            {reply.replies.map(childReply => (
              <ReplyItem
                key={childReply.id}
                reply={childReply}
                parentId={reply.id}
                onLikeReply={onLikeReply}
                onReplyToReply={onReplyToReply}
                userVotes={userVotes}
              />
            ))}
            <div style={{ marginBottom: 16 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplies(false)}>Hide Replies</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onLike, onReply, onLikeReply, onReplyToReply, userVotes }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const userVote = userVotes[comment.id];
  const likeCount = comment.Likes?.length ?? 0;
  const replyCount = comment.replies?.length ?? 0;
  const liked = userVote === 'like';

  return (
    <div style={{ display: 'flex', marginBottom: 16 }}>
      <div style={{ marginRight: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
          {getAvatarInitials(comment.User?.username)}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, marginRight: 8 }}>{comment.User?.username || 'Unknown'}</span>
          <span style={{ color: '#65676B', fontSize: 12 }}>{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <div style={{ marginBottom: 8 }}>{comment.content}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
          <button onClick={() => onLike(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: liked ? 'green' : '#65676B' }}>
            <i className={`bi ${liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`} />
            <span style={{ marginLeft: 4 }}>{likeCount}</span>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplyInput(v => !v)}>Reply</button>
        </div>
        {/* Reply input toggled by Reply button */}
        {showReplyInput && (
          <div style={{ marginBottom: 16 }}>
            <CFormTextarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a comment..."
              className="mb-2"
            />
            <CButton size="sm" color="primary" className="me-2" onClick={() => { onReply(comment.id, replyText); setReplyText(''); setShowReplyInput(false); }}>Send</CButton>
            <CButton size="sm" color="secondary" variant="outline" onClick={() => setShowReplyInput(false)}>Cancel</CButton>
          </div>
        )}
        {/* TikTok-style View Replies */}
        {replyCount > 0 && !showReplies && (
          <div style={{ marginLeft: 40, marginBottom: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplies(true)}>View {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</button>
          </div>
        )}
        {showReplies && comment.replies?.length > 0 && (
          <div style={{ marginLeft: 40, marginBottom: 16 }}>
            {comment.replies.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                parentId={comment.id}
                onLikeReply={onLikeReply}
                onReplyToReply={onReplyToReply}
                userVotes={userVotes}
              />
            ))}
            <div style={{ marginBottom: 16 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowReplies(false)}>Hide Replies</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscussionDetail() {
  console.log("DiscussionDetail mounted"); // DEBUG
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [galleryOpen, setGalleryOpen] = useState({ open: false, idx: 0 });

  // Function to load discussion detail and comments
  const fetchDiscussion = async () => {
    try {
      console.log('Fetching discussion', id); // DEBUG
      const data = await getDiscussion(id);
      setDiscussion(data);
      setComments(data.Comments || []); // use backend Comments property
      // Reset and initialize userVotes based on existing likes
      setUserVotes({});
      if (user) {
        const votes = {};
        const traverse = (items, parentId = null) => {
          items.forEach(item => {
            if (item.Likes?.some(l => l.userId === user.id)) {
              if (parentId) votes[`reply-${parentId}-${item.id}`] = 'like';
              else votes[item.id] = 'like';
            }
            if (item.replies?.length) traverse(item.replies, item.id);
          });
        };
        traverse(data.Comments || []);
        setUserVotes(votes);
      }
    } catch (err) {
      setError('Failed to load discussion.');
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  // Like for comments (backend)
  const handleLike = async (commentId) => {
    if (!user) return setError('You must be logged in to like comments.');
    if (userVotes[commentId] === 'like') return;
    try {
      await api.post(API_CONFIG.ENDPOINTS.LIKE_COMMENT(commentId), {}, { withCredentials: true });
      setComments(comments => comments.map(c => {
        if (c.id !== commentId) return c;
        const newLikes = [...(c.Likes || []), { userId: user.id, commentId }];
        return { ...c, Likes: newLikes };
      }));
      setUserVotes(votes => ({ ...votes, [commentId]: 'like' }));
    } catch (err) {
      setError('Failed to like comment.');
    }
  };

  // Like for replies (backend, assuming endpoint: /api/discussions/comments/:commentId/replies/:replyId/like)
  const handleLikeReply = async (parentId, replyId) => {
    if (!user) return setError('You must be logged in to like replies.');
    const voteKey = `reply-${parentId}-${replyId}`;
    if (userVotes[voteKey] === 'like') return;
    try {
      await api.post(`/api/discussions/comments/${parentId}/replies/${replyId}/like`, {}, { withCredentials: true });
      setComments(comments =>
        comments.map(c => updateReplyRecursive(c, parentId, replyId, reply => {
          const newLikes = [...(reply.Likes || []), { userId: user.id, commentId: replyId }];
          return { ...reply, Likes: newLikes };
        }))
      );
      setUserVotes(votes => ({ ...votes, [voteKey]: 'like' }));
    } catch (err) {
      setError('Failed to like reply.');
    }
  };

  // Add reply to comment (backend, assuming endpoint: /api/discussions/comments/:commentId/replies)
  const handleReply = async (commentId, replyText) => {
    if (!user) return setError('You must be logged in to reply.');
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/api/discussions/comments/${commentId}/replies`, { content: replyText }, { withCredentials: true });
      const newReply = { ...data, User: { id: user.id, username: user.username } };
      setComments(comments => comments.map(c => c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c));
    } catch (err) {
      setError('Failed to post reply.');
    }
    setLoading(false);
  };

  // Add reply to a reply (backend, assuming endpoint: /api/discussions/comments/:parentId/replies/:replyId/replies)
  const handleReplyToReply = async (parentId, replyId, replyText) => {
    if (!user) return setError('You must be logged in to reply.');
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/api/discussions/comments/${parentId}/replies/${replyId}/replies`, { content: replyText }, { withCredentials: true });
      const newReply = { ...data, User: { id: user.id, username: user.username } };
      setComments(comments =>
        comments.map(c => updateReplyRecursive(c, parentId, replyId, reply => ({ ...reply, replies: [...(reply.replies || []), newReply] })))
      );
    } catch (err) {
      setError('Failed to post reply to reply.');
    }
    setLoading(false);
  };

  // Recursive helper to update a reply by parentId and replyId
  function updateReplyRecursive(commentOrReply, parentId, replyId, updateFn) {
    if (commentOrReply.id === parentId && commentOrReply.replies) {
      return {
        ...commentOrReply,
        replies: commentOrReply.replies.map(r =>
          r.id === replyId ? updateFn(r) : updateReplyRecursive(r, parentId, replyId, updateFn)
        ),
      };
    } else if (commentOrReply.replies) {
      return {
        ...commentOrReply,
        replies: commentOrReply.replies.map(r => updateReplyRecursive(r, parentId, replyId, updateFn)),
      };
    }
    return commentOrReply;
  }

  // Add comment (backend)
  const handleComment = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) return setError('You must be logged in to comment.');
    if (!comment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await api.post(API_CONFIG.ENDPOINTS.CREATE_COMMENT(id), { content: comment }, { withCredentials: true });
      // Refresh discussion comments
      await fetchDiscussion();
      setComment('');
    } catch (err) {
      setError('Failed to post comment.');
    }
    setLoading(false);
  };

  if (!discussion) {
    return <CContainer className="py-5"><CAlert color="info">Loading discussion...</CAlert></CContainer>;
  }

  return (
    <div className="discussion-detail-scrollable">
      <CContainer className="py-4">
        <CRow className="justify-content-center">
          <CCol xs={12} md={10} lg={8}>
            <CCard className="shadow-lg border-0 rounded-4 mb-4">
              <CCardBody>
                <div className="mb-3">
                  <CButton color="secondary" variant="outline" onClick={() => navigate('/discussions')}>
                    &larr; Back to Discussions
                  </CButton>
                </div>
                <CCardTitle className="h3 fw-bold text-primary mb-2">{discussion.title}</CCardTitle>
                {/* Professional image gallery with fullscreen support */}
                {discussion.images && discussion.images.length > 0 && (
                  <div className="discussion-images mb-3 d-flex gap-2 flex-wrap">
                    {discussion.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Discussion image ${idx + 1}`}
                        className="rounded border shadow-sm discussion-detail-img"
                        style={{ maxHeight: 200, maxWidth: 320, cursor: 'pointer', objectFit: 'cover', transition: 'box-shadow 0.2s' }}
                        onClick={() => setGalleryOpen({ open: true, idx })}
                      />
                    ))}
                  </div>
                )}
                {/* Fullscreen modal gallery */}
                {galleryOpen.open && (
                  <div className="discussion-gallery-modal" style={{ position: 'fixed', zIndex: 1200, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,10,20,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setGalleryOpen({ open: false, idx: 0 })}>
                    <img
                      src={getImageUrl(discussion.images[galleryOpen.idx])}
                      alt={`Discussion image ${galleryOpen.idx + 1}`}
                      style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 12, boxShadow: '0 0 32px 0 #000a' }}
                      onClick={e => e.stopPropagation()}
                    />
                    {/* Navigation arrows if multiple images */}
                    {discussion.images.length > 1 && (
                      <>
                        <button
                          className="gallery-arrow left"
                          style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 36, cursor: 'pointer', zIndex: 1201 }}
                          onClick={e => { e.stopPropagation(); setGalleryOpen(g => ({ open: true, idx: (g.idx - 1 + discussion.images.length) % discussion.images.length })); }}
                        >&#8592;</button>
                        <button
                          className="gallery-arrow right"
                          style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 36, cursor: 'pointer', zIndex: 1201 }}
                          onClick={e => { e.stopPropagation(); setGalleryOpen(g => ({ open: true, idx: (g.idx + 1) % discussion.images.length })); }}
                        >&#8594;</button>
                      </>
                    )}
                    {/* Close button */}
                    <button
                      className="gallery-close"
                      style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer', zIndex: 1201 }}
                      onClick={e => { e.stopPropagation(); setGalleryOpen({ open: false, idx: 0 }); }}
                    >&times;</button>
                  </div>
                )}
                {/* Only show the title, not the content/body */}
                <CCard className="shadow-sm border-0 rounded-4 mb-4">
                  <CCardBody>
                  {discussion.content}
                    {/* <CCardTitle className="fw-bold fs-3 mb-2">{discussion.title}</CCardTitle> */}
                    {/* Content/body intentionally hidden as per request */}
                  </CCardBody>
                </CCard>
                <div className="mb-3">
                  {discussion.tags.map((tag, idx) => (
                    <CBadge color="info" className="me-1 mb-1" key={idx}>{tag}</CBadge>
                  ))}
                </div>
              </CCardBody>
            </CCard>
            <CCard className="shadow-sm border-0 rounded-4 mb-4">
              <CCardBody>
                <CForm onSubmit={handleComment} className="mb-4">
                  <CFormTextarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    placeholder="Write a comment..."
                    className="mb-2"
                    disabled={loading}
                  />
                  {error && <CAlert color="danger" className="mb-2">{error}</CAlert>}
                  <div className="d-flex justify-content-end">
                    <CButton color="primary" type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Comment'}</CButton>
                  </div>
                </CForm>
                <h5 className="fw-bold mb-3">Comments</h5>
                {comments.length === 0 ? (
                  <CAlert color="secondary">No comments yet. Be the first to comment!</CAlert>
                ) : (
                  comments.map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      onLike={handleLike}
                      onReply={handleReply}
                      onLikeReply={handleLikeReply}
                      onReplyToReply={handleReplyToReply}
                      userVotes={userVotes}
                    />
                  ))
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}
