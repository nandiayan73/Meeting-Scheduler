import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { toast ,ToastContainer} from 'react-toastify';
import Navbar from "../Navbar";

export default function Login() {


  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true 
        });
        
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/login", 
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true 
        }
      );
      
      toast.success("Welcome!", { autoClose: 2000 });
      navigate('/dashboard');
    } catch (error) {
      toast.error("Invalid Credentials!", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <Navbar></Navbar>
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
        <center>
              <img 
                      src="https://thumbs.dreamstime.com/b/ms-logo-vector-modern-initial-circle-red-ash-color-arches-363653058.jpg" 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover object-top 
                                hover:shadow-lg hover:brightness-110 hover:scale-110 
                                transition-all duration-300 ease-in-out cursor-pointer"
              />
            </center> 
          <h1 className="text-3xl font-semibold text-gray-800">Sign in</h1>
          <p className="text-gray-500 text-sm mt-2">to continue to Meeting Scheduler</p>
        </div>
        <ToastContainer /> 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition flex justify-center items-center ${
              loading ? "cursor-not-allowed opacity-80" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Next"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New to Meeting Scheduler?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}