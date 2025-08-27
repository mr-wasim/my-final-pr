
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminLayout({ children }){
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if(!res.ok){
        router.replace("/login?role=admin");
      } else {
        const { user } = await res.json();
        if(user.role !== "admin") router.replace("/login?role=admin");
        else setOk(true);
      }
    })();
  }, [router]);
  if(!ok) return <div className="min-h-screen grid place-items-center"><div className="w-64 h-32 skeleton rounded-2xl"/></div>;
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
