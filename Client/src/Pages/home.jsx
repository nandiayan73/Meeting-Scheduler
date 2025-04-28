import Navbar from "../Components/Navbar";
export default function Home() {
    return (
      <div className="bg-gray-900">
      <Navbar></Navbar>
      <div className="flex flex-col items-center  bg-gray-900 justify-center min-h-[87vh]">
        <h1 className="text-4xl font-bold mb-4" style={{color:"white"}}>Welcome to Meeting Scheduler</h1>
        <p className="text-gray-600" style={{color:"white"}}>Plan, Manage, and Track your meetings easily!</p>
      </div>
      </div>
    );
  }
  