import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import LoginSignup from './components/LoginSignup';
import WasteCollectionForm from './components/WasteCollectionForm';
import Marketplace from './components/Marketplace';
import ProductDetails from './components/ProductDetails';
import { auth, db } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import UserDashboard from './components/UserDashboard';
import ProfileManagement from './components/ProfileManagement';
import SellerForm from './components/SellerForm';
import AdminDashboard from './components/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import Services from './components/Services';
import Contact from './components/Contact';
import AboutUs from './components/AboutUs';
import WasteCollectionFormTest from './components/WasteCollectionFormTest';
import PasswordReset from './components/PasswordReset'; // Add this import

const App = () => {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const role = userDoc.data().role || 'user';
            setUserRole(role);
            console.log('Fetched user role:', role);
          } else {
            setUserRole('user');
            console.log('User document does not exist. Defaulting to "user".');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      }
    };
    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const PrivateRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!user || userRole !== 'admin') return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <AppNavbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/password-reset" element={<PasswordReset />} /> {/* Added route */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/test" element={<WasteCollectionFormTest />} />

        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfileManagement />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/user-dashboard" 
          element={
            <PrivateRoute>
              <UserDashboard userRole={userRole} />
            </PrivateRoute>
          }
        />
        
        <Route 
          path="/waste-request" 
          element={
            <PrivateRoute>
              <WasteCollectionForm />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/sell-product" 
          element={
            <PrivateRoute>
              <SellerForm />
            </PrivateRoute>
          } 
        />

        {/* Admin Route */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;