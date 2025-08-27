
import { getDb } from "../lib/auth";

export async function Collections() {
  const db = await getDb();
  return {
    users: db.collection("users"),
    serviceForms: db.collection("serviceForms"),
    calls: db.collection("calls"),
    payments: db.collection("payments")
  };
}
