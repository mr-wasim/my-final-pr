
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "./_app";

export default function LoginPage(){
  const router = useRouter();
  const role = (router.query.role || "admin");
  const { push } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e){
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if(res.ok){
      push("Login successful");
      if(data.user.role === "admin") router.push("/admin/dashboard");
      else router.push("/tech/dashboard");
    } else {
      push(data.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Login ({role})</h1>
          <p className="text-sm text-slate-500">Enter your credentials</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} required className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="admin or tech username" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="••••••••" />
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-900 text-white">Login</button>
          <p className="text-xs text-slate-500">Admin username: admin (password set in database). No autofill.</p>
        </form>
      </div>
    </div>
  )
}
