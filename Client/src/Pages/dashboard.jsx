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
          withCredentials: true 
        });
        
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]); 
  return (
    <div>

      <Navbar></Navbar>
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <center>
            <h1 className="text-4xl font-bold mb-4 text-red-500  glow-text">Welcome To Dashboard</h1>
            <p className="text-4xs font-bold mb-8 text-white">Schedule & Create Meetings</p>
           

        </center>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link 
            to="/calendar" 
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-start space-y-2"
          >
            <h2 className="text-3xl font-semibold text-[#1DA1F2]  mb-2">📅 View Calendar</h2>
            <p className="text-gray-500 text-base">See all your scheduled meetings in a weekly view.</p>
          </Link>

          <Link 
            to="/create" 
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-start space-y-2"
          >
            <h2 className="text-3xl font-semibold text-green-600 mb-2">➕ Create Meeting</h2>
            <p className="text-gray-500 text-base">Set up a new meeting and invite participants.</p>
          </Link>
        </div>

      </div>
    </div>
    </div>

  );
}