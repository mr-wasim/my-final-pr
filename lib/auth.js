
import jwt from "jsonwebtoken";
import cookie from "cookie";
import bcrypt from "bcryptjs";
import clientPromise from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

export function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.setHeader("Set-Cookie", cookie.serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  }));
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", cookie.serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  }));
}

export function getUserFromReq(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) return null;
    const data = jwt.verify(token, JWT_SECRET);
    return data;
  } catch (e) {
    return null;
  }
}

export async function ensureAdminSeed() {
  const db = await getDb();
  const users = db.collection("users");
  const admin = await users.findOne({ role: "admin", username: "admin" });
  const fixedPass = "Chimneysolution@123#";
  if (!admin) {
    const hash = await bcrypt.hash(fixedPass, 10);
    await users.insertOne({
      role: "admin",
      username: "admin",
      password: hash,
      createdAt: new Date()
    });
  }
}

export async function findUserByCredentials(username, password, role) {
  const db = await getDb();
  const users = db.collection("users");
  const user = await users.findOne({ username, role });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { _id: user._id.toString(), username: user.username, role: user.role, name: user.name || user.username };
}
