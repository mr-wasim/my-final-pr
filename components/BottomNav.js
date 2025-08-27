import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  DocumentTextIcon as DocumentOutline,
  PhoneIcon as PhoneOutline,
  CreditCardIcon as CardOutline,
  UserCircleIcon as UserOutline,
} from "@heroicons/react/24/outline";

import {
  DocumentTextIcon as DocumentSolid,
  PhoneIcon as PhoneSolid,
  CreditCardIcon as CardSolid,
  UserCircleIcon as UserSolid,
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const r = useRouter();
  const tabs = [
    { href: "/tech/dashboard?tab=form", outline: DocumentOutline, solid: DocumentSolid, label: "Form" },
    { href: "/tech/dashboard?tab=calls", outline: PhoneOutline, solid: PhoneSolid, label: "Calls" },
    { href: "/tech/dashboard?tab=payments", outline: CardOutline, solid: CardSolid, label: "Payments" },
    { href: "/tech/dashboard?tab=user", outline: UserOutline, solid: UserSolid, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map((t) => {
          const active = r.asPath.includes(t.href.split("?")[1]);
          const Icon = active ? t.solid : t.outline;

          return (
            <Link key={t.href} href={t.href} className="relative flex flex-col items-center">
              {/* Active circular highlight */}
              {active && (
                <motion.div
                  layoutId="activeCircle"
                  className="absolute top-1 w-10 h-10 rounded-full bg-blue-100"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: active ? 1.2 : 1,
                  y: active ? -3 : 0,
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`p-2 relative z-10 ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className="w-6 h-6" />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium transition ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
