import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { isAdminMobileFirstRoute } from "../config/adminNav";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobileFirst = isAdminMobileFirstRoute(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main
          className={
            isMobileFirst
              ? "flex-1 overflow-y-auto px-4 py-5 lg:px-6"
              : "flex-1 overflow-y-auto p-4 md:p-6"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
