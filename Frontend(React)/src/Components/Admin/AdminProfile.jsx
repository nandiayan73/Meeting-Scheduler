import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove the admin token cookie
        Cookies.remove('adminToken');
        // Redirect to login page
        navigate('/admin/auth');
        toast.success('Logged out successfully!');
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="text-white font-semibold text-lg">Admin Dashboard</div>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-white px-4 py-2 hover:bg-gray-700 rounded-lg"
                    >
                        Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="ml-4 text-white px-4 py-2 hover:bg-red-600 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

const AdminProfile = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [meetingSearch, setMeetingSearch] = useState('');
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    useEffect(() => {
        const token = Cookies.get('adminToken');
        if (!token) {
            navigate('/admin/auth');
        }
    }, [navigate]);

    const handleDeleteUser = () => {
        setIsModalOpen(true);
    };

    const handleDeleteMeeting = () => {
        setIsMeetingModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsMeetingModalOpen(false);
        setUserEmail('');
        setMeetingSearch('');
        setMeetings([]);
        setLoading(false);
        setSelectedMeeting(null);
    };

    const handleDeleteConfirmation = async () => {
        setLoading(true);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        try {
            const { data } = await axios.post(
                'http://localhost:3000/admin/delete-user',
                { userEmail },
                { withCredentials: true, signal: controller.signal }
            );

            toast.success(data?.message || "User deleted successfully!");
        } catch (error) {
            console.error(error);
            if (axios.isCancel(error)) {
                toast.error('Request timed out. Please try again.');
            } else {
                toast.error(error?.response?.data?.message || 'Error deleting user');
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    const handleSearchMeeting = async (e) => {
        const searchQuery = e.target.value;
        setMeetingSearch(searchQuery);

        if (searchQuery.length >= 3) {
            setLoading(true);
            try {
                const { data } = await axios.post(
                    'http://localhost:3000/admin/suggest-meetings',
                    { query: searchQuery }
                );
                setMeetings(data);
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Error fetching meeting suggestions');
            } finally {
                setLoading(false);
            }
        } else {
            setMeetings([]);
        }
    };

    const handleDeleteSelectedMeeting = async () => {
        if (!selectedMeeting) return;

        setLoading(true);
        try {
            const { data } = await axios.post(
                'http://localhost:3000/admin/delete-meeting',
                { meetingId: selectedMeeting._id },
                { withCredentials: true }
            );
            toast.success(data?.message || 'Meeting deleted successfully!');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error deleting meeting');
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    return (
        <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{ zIndex: 9999 }}
            />

            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Dashboard</h1>

                <div className="flex flex-col gap-6">
                    <button
                        onClick={handleDeleteUser}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md"
                    >
                        Delete User
                    </button>

                    <button
                        onClick={handleDeleteMeeting}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md"
                    >
                        Delete Meeting
                    </button>
                </div>
            </div>

            {/* Modal for Delete User */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold text-center mb-4">Delete User</h2>
                        <input
                            type="email"
                            placeholder="Enter User Email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md mb-4"
                        />
                        <div className="flex justify-around">
                            <button
                                onClick={handleDeleteConfirmation}
                                disabled={loading}
                                className={`bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                ) : (
                                    'Confirm'
                                )}
                            </button>

                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Delete Meeting */}
            {isMeetingModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold text-center mb-4">Search and Delete Meeting</h2>
                        <input
                            type="text"
                            placeholder="Search for meeting by name..."
                            value={meetingSearch}
                            onChange={handleSearchMeeting}
                            className="w-full px-4 py-2 border rounded-md mb-4"
                        />

                        {loading && <div className="text-center text-blue-500">Loading...</div>}

                        {meetings.length > 0 && (
                            <ul className="mb-4">
                                {meetings.map((meeting) => (
                                    <li
                                        key={meeting._id}
                                        className="p-2 border-b hover:bg-gray-200 cursor-pointer"
                                        onClick={() => setSelectedMeeting(meeting)}
                                    >
                                        {meeting.title}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {selectedMeeting && (
                            <div className="mt-4">
                                <p>Are you sure you want to delete the meeting: <strong>{selectedMeeting.title}</strong>?</p>
                                <button
                                    onClick={handleDeleteSelectedMeeting}
                                    disabled={loading}
                                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 mt-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                    ) : (
                                        'Confirm Delete'
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="flex justify-around mt-4">
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export { AdminProfile, Navbar };
