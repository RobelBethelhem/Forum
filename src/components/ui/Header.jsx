import React from 'react';
import { CNavbar, CContainer, CNavbarBrand, CNavbarToggler, CCollapse, CNav, CNavItem, CNavLink, CButton, CBadge } from '@coreui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { getPendingTestimonies } from '../../services/testimonies';
import BottomNav from './BottomNav';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/discussions', label: 'Discussions' },
  { to: '/discussions/create', label: 'Create' },
  { to: '/testimonies', label: 'Testimonies' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = React.useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchPendingCount() {
      if (user?.role === 'admin') {
        try {
          const data = await getPendingTestimonies();
          if (isMounted) setPendingCount(Array.isArray(data) ? data.length : 0);
        } catch {
          if (isMounted) setPendingCount(0);
        }
      }
    }
    fetchPendingCount();
    return () => { isMounted = false; };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <CNavbar expand="lg" colorScheme="light" className="mb-4 shadow-sm bg-white sticky-top w-100 p-0 d-none d-md-flex" placement="top" style={{minHeight:'64px'}}>
        <CContainer fluid className="px-3" style={{ maxWidth: '100vw', minWidth: 0 }}>
          <div style={{width:'100%', maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <CNavbarBrand as={Link} to="/" className="fw-bold fs-4 text-primary" style={{ letterSpacing: 1 }}>Forum</CNavbarBrand>
            <div className="d-flex align-items-center">
              <CNavbarToggler onClick={() => setVisible(!visible)} />
              <CCollapse className="navbar-collapse justify-content-end" visible={visible}>
                <CNav className="align-items-center gap-2 gap-lg-3 w-100 justify-content-lg-end">
                  {navLinks.map(link => (
                    <CNavItem key={link.to}>
                      <CNavLink
                        as={Link}
                        to={link.to}
                        active={location.pathname === link.to}
                        className={location.pathname === link.to ? 'fw-bold text-primary' : ''}
                        style={{ fontSize: 17 }}
                      >
                        {link.label}
                      </CNavLink>
                    </CNavItem>
                  ))}
                  <CNavItem>
                    <CNavLink
                      as={Link}
                      to="/testimonies/create"
                      active={location.pathname === '/testimonies/create'}
                      className={location.pathname === '/testimonies/create' ? 'fw-bold text-primary' : ''}
                      style={{ fontSize: 17 }}
                    >
                      Create Testimony
                    </CNavLink>
                  </CNavItem>
                  {user?.role === 'admin' && (
                    <CNavItem>
                      <CNavLink
                        as={Link}
                        to="/testimonies/pending"
                        active={location.pathname === '/testimonies/pending'}
                        className={location.pathname === '/testimonies/pending' ? 'fw-bold text-danger position-relative' : 'position-relative'}
                        style={{ fontSize: 17 }}
                      >
                        Approve Testimonies
                        {pendingCount > 0 && (
                          <CBadge color="danger" className="ms-2" style={{ fontSize: 13, verticalAlign: 'middle' }}>{pendingCount}</CBadge>
                        )}
                      </CNavLink>
                    </CNavItem>
                  )}
                  {user ? (
                    <>
                      <CNavItem>
                        <CNavLink as={Link} to="/profile" active={location.pathname === '/profile'} style={{ fontSize: 17 }}>Profile</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CButton color="secondary" size="sm" className="ms-lg-2 px-4" onClick={handleLogout}>Logout</CButton>
                      </CNavItem>
                    </>
                  ) : (
                    <>
                      <CNavItem>
                        <CNavLink as={Link} to="/login" active={location.pathname === '/login'} style={{ fontSize: 17 }}>Login</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CButton color="primary" size="sm" className="ms-lg-2 px-4" as={Link} to="/register">Register</CButton>
                      </CNavItem>
                    </>
                  )}
                </CNav>
              </CCollapse>
            </div>
          </div>
        </CContainer>
      </CNavbar>
      <BottomNav />
    </>
  );
};

export default Header;
