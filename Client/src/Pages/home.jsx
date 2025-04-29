import Navbar from "../Components/Navbar";
export default function Home() {
    return (
      <div className="bg-gray-900">
      <Navbar></Navbar>
      <div className="flex flex-col items-center  bg-gray-900 justify-center min-h-[88vh]">
      <center>
              <img 
                      src="https://thumbs.dreamstime.com/b/ms-logo-vector-modern-initial-circle-red-ash-color-arches-363653058.jpg" 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover object-top 
                                hover:shadow-lg hover:brightness-110 hover:scale-110 
                                transition-all duration-300 ease-in-out cursor-pointer"
              />
            </center> 
        <h1 className="text-4xl font-bold mb-4" style={{color:"white"}}>Welcome to Meeting Scheduler</h1>
        <p className="text-gray-600" style={{color:"white"}}>Plan, Manage, and Track your meetings easily!</p>
      </div>
      </div>
    );
  }
  