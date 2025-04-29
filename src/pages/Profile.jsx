import React from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CAvatar, CAlert } from '@coreui/react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={8} lg={6}>
          <CCard className="shadow-lg border-0 rounded-4">
            <CCardBody>
              <CCardTitle className="h4 fw-bold text-primary mb-3">Profile</CCardTitle>
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  <CAvatar size="lg" src={user.avatar || undefined} />
                  <div>
                    <div className="fw-semibold fs-5">{user.username || user.email}</div>
                    <div className="text-secondary">{user.email}</div>
                  </div>
                </div>
              ) : (
                <CAlert color="secondary">You are not logged in.</CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Profile;
