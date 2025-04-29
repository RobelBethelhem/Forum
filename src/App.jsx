import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/ui/Layout';
import Home from './pages/Home';
import Discussions from './pages/Discussions';
import DiscussionDetail from './components/discussion/DiscussionDetail';
import CreateDiscussion from './components/discussion/CreateDiscussion';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Testimonies from './pages/Testimonies';
import CreateTestimony from './pages/CreateTestimony';
import PendingTestimonies from './pages/PendingTestimonies';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/discussions/create" element={<CreateDiscussion />} />
            <Route path="/discussions/:id" element={<DiscussionDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/testimonies" element={<Testimonies />} />
            <Route path="/testimonies/create" element={<CreateTestimony />} />
            <Route path="/testimonies/pending" element={<PendingTestimonies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
