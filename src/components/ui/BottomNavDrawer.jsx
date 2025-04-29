import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaSignInAlt, FaRegUser, FaRegListAlt, FaPlusSquare, FaPlusCircle, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { COffcanvas, COffcanvasHeader, COffcanvasBody, CButton } from '@coreui/react';
import { useAuth } from '../../hooks/useAuth';

const BottomNavDrawer = ({ visible, setVisible, pendingCount }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  return (
    <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)}>
      <COffcanvasHeader className="d-flex align-items-center justify-content-between">
        <span className="fw-bold">More</span>
        <CButton color="link" className="p-0 ms-auto" onClick={() => setVisible(false)}>
          <FaTimes size={22} />
        </CButton>
      </COffcanvasHeader>
      <COffcanvasBody className="d-flex flex-column gap-3">
        {user?.role === 'admin' && (
          <Link to="/testimonies/pending" className={`d-flex align-items-center gap-2${location.pathname === '/testimonies/pending' ? ' fw-bold text-danger' : ''}`} onClick={() => setVisible(false)}>
            <FaRegListAlt /> Approve Testimonies
            {pendingCount > 0 && <span className="badge bg-danger ms-2">{pendingCount}</span>}
          </Link>
        )}
        {user ? (
          <>
            <Link to="/profile" className={`d-flex align-items-center gap-2${location.pathname === '/profile' ? ' fw-bold text-primary' : ''}`} onClick={() => setVisible(false)}>
              <FaUser /> Profile
            </Link>
            <Link to="/testimonies/create" className={`d-flex align-items-center gap-2${location.pathname === '/testimonies/create' ? ' fw-bold text-primary' : ''}`} onClick={() => setVisible(false)}>
              <FaPlusSquare /> Create Testimony
            </Link>
            <CButton color="danger" variant="outline" className="d-flex align-items-center gap-2 mt-2" onClick={() => { logout(); setVisible(false); }}>
              <FaSignOutAlt /> Logout
            </CButton>
          </>
        ) : (
          <>
            <Link to="/login" className={`d-flex align-items-center gap-2${location.pathname === '/login' ? ' fw-bold text-primary' : ''}`} onClick={() => setVisible(false)}>
              <FaSignInAlt /> Login
            </Link>
            <Link to="/register" className={`d-flex align-items-center gap-2${location.pathname === '/register' ? ' fw-bold text-primary' : ''}`} onClick={() => setVisible(false)}>
              <FaRegUser /> Register
            </Link>
          </>
        )}
      </COffcanvasBody>
    </COffcanvas>
  );
};

export default BottomNavDrawer;
