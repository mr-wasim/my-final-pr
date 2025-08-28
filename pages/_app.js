// pages/_app.js
import "../styles/globals.css";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/router";

const ToastContext = createContext({ push: () => {} });
const UserContext = createContext({ user: null, setUser: () => {} });

export default function MyApp({ Component, pageProps }) {
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  function pushToast(msg) {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  // Restore user from localStorage (so refresh or webview restart keeps session)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // 🚀 Redirect logic: agar already login hai to choose-page skip karo
        if (router.pathname === "/choose") {
          if (parsed.role === "admin") router.replace("/admin");
          if (parsed.role === "technician") router.replace("/technician");
        }
      }
    } catch (e) {
      localStorage.removeItem("user");
    }
  }, [router]);

  // small route change loader
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const start = () => setLoading(true);
    const stop = () => setLoading(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", stop);
    router.events.on("routeChangeError", stop);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", stop);
      router.events.off("routeChangeError", stop);
    };
  }, [router.events]);

  return (
    <ToastContext.Provider value={{ push: pushToast }}>
      <UserContext.Provider value={{ user, setUser }}>
        {loading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
            <div className="w-24 h-24 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
        )}
        <Component {...pageProps} />
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="px-4 py-2 rounded-xl shadow-lg bg-black text-white"
            >
              {t.msg}
            </div>
          ))}
        </div>
      </UserContext.Provider>
    </ToastContext.Provider>
  );
}

// hooks
export function useToast() {
  return useContext(ToastContext);
}

export function useUser() {
  return useContext(UserContext);
}
