import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CForm, CFormInput, CButton, CAlert } from '@coreui/react';
import API_CONFIG, { api } from '../../services/api';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(API_CONFIG.ENDPOINTS.REGISTER, form);
      setLoading(false);
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol xs={12} md={6} lg={4}>
          <CCard className="shadow-lg border-0 rounded-4">
            <CCardBody>
              <CCardTitle className="h4 fw-bold text-primary mb-3">Register</CCardTitle>
              <CForm onSubmit={handleSubmit} autoComplete="off">
                <CFormInput
                  type="text"
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="mb-3"
                  placeholder="Choose a username"
                  disabled={loading}
                />
                <CFormInput
                  type="email"
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mb-3"
                  placeholder="Enter your email"
                  disabled={loading}
                />
                <CFormInput
                  type="password"
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="mb-3"
                  placeholder="Create a password"
                  disabled={loading}
                />
                {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
                <div className="d-flex justify-content-end">
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                  </CButton>
                </div>
              </CForm>
              <div className="mt-4 text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 underline">Login</Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Register;
