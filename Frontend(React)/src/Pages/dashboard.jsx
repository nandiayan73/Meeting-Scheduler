import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true // Include cookies if using session-based auth
        });
        
        // If status is not in 200-299 range, it will go to catch block
        // console.log("User is authenticated", response.data._id);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]); // Add navigate to dependency array

  return (
    <div>

      <Navbar></Navbar>
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-700">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/calendar" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">📅 View Calendar</h2>
            <p className="text-gray-600">See all your scheduled meetings in a weekly view.</p>
          </Link>

          <Link to="/create" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-bold text-green-600 mb-2">➕ Create Meeting</h2>
            <p className="text-gray-600">Set up a new meeting and invite participants.</p>
          </Link>
        </div>
      </div>
    </div>
    </div>

  );
}