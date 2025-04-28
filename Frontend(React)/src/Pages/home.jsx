import Navbar from "../Components/Navbar";
export default function Home() {
    return (
      <div>
      <Navbar></Navbar>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-4">Welcome to Meeting Scheduler</h1>
        <p className="text-gray-600">Plan, Manage, and Track your meetings easily!</p>
      </div>
      </div>
    );
  }
  