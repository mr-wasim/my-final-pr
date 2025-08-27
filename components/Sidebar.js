
import Link from "next/link";
import { useRouter } from "next/router";

const items = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/service-forms", label: "Service Forms" },
  { href: "/admin/call-forwarding", label: "Call Forwarding" },
  { href: "/admin/forwarded-calls", label: "Forwarded Calls" },
  { href: "/admin/payments", label: "Reports / Payments" },
  { href: "/admin/technicians", label: "Technicians" }
];

export default function Sidebar(){
  const router = useRouter();
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r p-4 hidden md:block">
      <div className="font-extrabold text-xl mb-6">Chimney CRM</div>
      <nav className="space-y-1">
        {items.map(it => (
          <Link key={it.href} href={it.href} className={`block px-3 py-2 rounded-xl ${router.pathname===it.href ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
