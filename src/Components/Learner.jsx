import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"
import NewSideBar from "./NewSideBar";

const Learner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
  <>
      <Navbar  setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <section className="flex w-full h-full">
        <div>
        <NewSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        <div className="w-full min-h-full mt-20 overflow-hidden">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default Learner;
