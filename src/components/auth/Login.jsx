import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CForm, CFormInput, CButton, CAlert } from '@coreui/react';
import { useAuth } from '../../hooks/useAuth';
import API_CONFIG, { api } from '../../services/api';

const Login = () => {
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
      setAuth(res.data.user, res.data.token);
      setIsLoading(false);
      navigate('/discussions');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={6} lg={4}>
          <CCard className="shadow-lg border-0 rounded-4">
            <CCardBody>
              <CCardTitle className="h4 fw-bold text-primary mb-3">Login</CCardTitle>
              <CForm onSubmit={handleSubmit} autoComplete="off">
                <CFormInput
                  type="email"
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mb-3"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <CFormInput
                  type="password"
                  label="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="mb-3"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
                <div className="d-flex justify-content-end">
                  <CButton color="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </CButton>
                </div>
              </CForm>
              <div className="mt-4 text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 underline">Register</Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Login;
