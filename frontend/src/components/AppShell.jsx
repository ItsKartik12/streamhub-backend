import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Navbar onMenu={() => setSidebarOpen((value) => !value)} />
      <div className="app-layout">
        <Sidebar open={sidebarOpen} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
