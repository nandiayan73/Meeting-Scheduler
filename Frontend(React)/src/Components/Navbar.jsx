import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Modal component for confirmation
const LogoutModal = ({ showModal, onClose, onConfirm }) => {
  if (!showModal) return null; // Don't render the modal if showModal is false

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold text-center">Are you sure you want to log out?</h3>
        <div className="mt-4 flex justify-center gap-4">
          <button 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Yes, Log Out
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authenticated', 'unauthenticated'
  const [image, setImage] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true
        });
        setAuthStatus('authenticated');
        setImage(response.data.image);
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };
    checkAuth();
  }, []); // This effect runs only once on component mount

  const handleLogout = async () => {
    setShowModal(true); // Show the logout confirmation modal
  };

  const handleLogoutConfirm = async () => {
    try {
      await axios.get("http://localhost:3000/logout", {
        withCredentials: true
      });
      setAuthStatus('unauthenticated');
      setShowModal(false); // Close the modal after successful logout
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowModal(false); // Close the modal without logging out
  };

  const handleLoginSuccess = () => {
    setAuthStatus('authenticated');
    navigate('/dashboard');  // Navigate to the dashboard after login
  };

  // Show loading state while checking auth
  if (authStatus === 'checking') {
    return (
      <nav className="flex justify-between p-4 bg-blue-600 text-white items-center">
        <Link to="/" className="font-bold text-xl">Meeting Scheduler</Link>
        <div className="space-x-4 flex items-center">
          <span>Loading...</span>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex justify-between p-4 bg-blue-600 text-white items-center">
        <Link to="/" className="font-bold text-xl">Meeting Scheduler</Link>
        <div className="space-x-4 flex items-center">
          {authStatus === 'unauthenticated' ? (
            <>

              <Link to="/admin/auth" className="hover:underline">Admin</Link>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              {image && (
                <img 
                  src={image} 
                  alt="Profile" 
                  style={{ width: "40px", height:"40px",borderRadius: "50%",objectFit: "cover",objectPosition: "top center" }}
                />
              )}

              <Link to="/profile" className="hover:underline">Profile</Link>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* The Logout Confirmation Modal */}
      <LogoutModal 
        showModal={showModal} 
        onClose={handleLogoutCancel} 
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}