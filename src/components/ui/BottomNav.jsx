import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaComments, FaPlusCircle, FaBookOpen, FaBars } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import BottomNavDrawer from './BottomNavDrawer';
import { getPendingTestimonies } from '../../services/testimonies';
import './BottomNav.css';

const mainNavItems = [
  { to: '/', icon: <FaHome />, label: 'Home', show: () => true },
  { to: '/discussions', icon: <FaComments />, label: 'Discussions', show: () => true },
  { to: '/testimonies', icon: <FaBookOpen />, label: 'Testimonies', show: () => true },
  // Removed Create Testimony from main nav for mobile, now only in drawer
];

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [drawerVisible, setDrawerVisible] = useState(false);
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

  return (
    <nav className="bottom-nav">
      {mainNavItems.filter(item => item.show(user)).map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={`bottom-nav__item${location.pathname === item.to ? ' active' : ''}`}
        >
          {item.icon}
        </Link>
      ))}
      <button className="bottom-nav__item bg-transparent border-0" style={{ outline: 'none' }} onClick={() => setDrawerVisible(true)}>
        <FaBars />
        {pendingCount > 0 && user?.role === 'admin' && (
          <span className="badge bg-danger position-absolute top-0 end-0" style={{ fontSize: 11, right: 8, top: 5 }}>{pendingCount}</span>
        )}
      </button>
      <BottomNavDrawer visible={drawerVisible} setVisible={setDrawerVisible} pendingCount={pendingCount} />
    </nav>
  );
};

export default BottomNav;
