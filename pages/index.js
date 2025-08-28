
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0, y: 20 }} animate={{ opacity:1, y:0 }} className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold">Chimney CRM</h1>
          <p className="text-slate-200 mt-2">Professional Admin & Technician Workflow</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href={{ pathname: "/login", query: { role: "admin" }}} className="rounded-2xl bg-white/10 hover:bg-white/20 p-6 backdrop-blur border border-white/10 transition">
            <h2 className="text-2xl font-semibold mb-2">Admin Login</h2>
            <p>Manage technicians, forward calls, reports & payments.</p>
          </Link>
          <Link href={{ pathname: "/login", query: { role: "technician" }}} className="rounded-2xl bg-white/10 hover:bg-white/20 p-6 backdrop-blur border border-white/10 transition">
            <h2 className="text-2xl font-semibold mb-2">Technician Login</h2>
            <p>Fill service forms, view forwarded calls, submit payments.</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
