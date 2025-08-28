import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Menu } from "lucide-react"; // hamburger icon

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.replace("/login?role=admin");
      } else {
        const { user } = await res.json();
        if (user.role !== "admin") router.replace("/login?role=admin");
        else setOk(true);
      }
    })();
  }, [router]);

  if (!ok)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-64 h-32 skeleton rounded-2xl" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center px-4 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-3 font-semibold text-lg">Admin Panel</h1>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 transform bg-white shadow-lg z-30 
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:flex
        `}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
