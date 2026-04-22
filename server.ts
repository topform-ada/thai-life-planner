import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || "3000");
const JWT_SECRET = process.env.JWT_SECRET || "thai-life-dev-secret-change-me";
const DB_PATH = process.env.DB_PATH || "./data/database.db";

const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    position TEXT DEFAULT 'ตัวแทน',
    affiliation TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    subscription_status TEXT DEFAULT 'none',
    subscription_expiry TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    last_seen TEXT
  );
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT DEFAULT '',
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const ownerExists = db.prepare("SELECT id FROM users WHERE role='owner' LIMIT 1").get();
if (!ownerExists) {
  const hash = bcrypt.hashSync("admin1234", 12);
  db.prepare("INSERT OR IGNORE INTO users (username,password,role,subscription_status) VALUES (?,?,'owner','annual')")
    .run("admin@thailife.app", hash);
  console.log("Owner created: admin@thailife.app / admin1234");
}

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

const auth = (req: any, res: any, next: any) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    db.prepare("UPDATE users SET last_seen=datetime('now','localtime') WHERE id=?").run(req.user.id);
    next();
  } catch {
    res.clearCookie("token");
    res.status(401).json({ error: "Session หมดอายุ" });
  }
};

const adminAuth = (req: any, res: any, next: any) => {
  auth(req, res, () => {
    if (!["owner","admin","assistant"].includes(req.user.role))
      return res.status(403).json({ error: "ไม่มีสิทธิ์" });
    next();
  });
};

app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// AUTH
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password || password.length < 6)
    return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
  try {
    const hash = await bcrypt.hash(password, 12);
    const r = db.prepare("INSERT INTO users (username,password) VALUES (?,?)").run(username.trim().toLowerCase(), hash);
    const token = jwt.sign({ id: r.lastInsertRowid, username: username.trim().toLowerCase(), role: "user" }, JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV==="production", maxAge: 30*24*60*60*1000, sameSite: "lax" });
    res.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return res.status(409).json({ error: "Username นี้ถูกใช้แล้ว" });
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username=?").get(username?.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Username หรือรหัสผ่านไม่ถูกต้อง" });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV==="production", maxAge: 30*24*60*60*1000, sameSite: "lax" });
  const { password: _, ...safe } = user;
  res.json(safe);
});

app.get("/api/auth/me", auth, (req: any, res) => {
  const u: any = db.prepare("SELECT id,username,role,first_name,last_name,position,affiliation,subscription_status,subscription_expiry FROM users WHERE id=?").get(req.user.id);
  if (!u) return res.status(401).json({ error: "ไม่พบผู้ใช้" });
  res.json(u);
});

app.post("/api/auth/logout", (_, res) => { res.clearCookie("token"); res.json({ success: true }); });

app.put("/api/auth/profile", auth, (req: any, res) => {
  const { first_name, last_name, position, affiliation, notes } = req.body;
  db.prepare("UPDATE users SET first_name=?,last_name=?,position=?,affiliation=?,notes=? WHERE id=?")
    .run(first_name||"", last_name||"", position||"", affiliation||"", notes||"", req.user.id);
  res.json({ success: true });
});

// CLIENTS
app.get("/api/clients", auth, (req: any, res) => {
  const rows = db.prepare("SELECT id,data,updated_at FROM clients WHERE user_id=? ORDER BY updated_at DESC").all(req.user.id) as any[];
  res.json(rows.map(r => ({ ...JSON.parse(r.data), _updatedAt: r.updated_at })));
});

app.post("/api/clients", auth, (req: any, res) => {
  const c = req.body; const id = c.id || `c${Date.now()}`;
  db.prepare("INSERT OR REPLACE INTO clients (id,user_id,name,data,updated_at) VALUES (?,?,?,?,datetime('now','localtime'))")
    .run(id, req.user.id, c.name||"", JSON.stringify({...c,id}));
  res.json({ id, success: true });
});

app.put("/api/clients/:id", auth, (req: any, res) => {
  if (!db.prepare("SELECT id FROM clients WHERE id=? AND user_id=?").get(req.params.id, req.user.id))
    return res.status(404).json({ error: "ไม่พบข้อมูล" });
  db.prepare("UPDATE clients SET data=?,name=?,updated_at=datetime('now','localtime') WHERE id=? AND user_id=?")
    .run(JSON.stringify(req.body), req.body.name||"", req.params.id, req.user.id);
  res.json({ success: true });
});

app.delete("/api/clients/:id", auth, (req: any, res) => {
  db.prepare("DELETE FROM clients WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// CALENDAR
app.get("/api/calendar", auth, (req: any, res) => {
  const rows = db.prepare("SELECT data FROM calendar_events WHERE user_id=? ORDER BY created_at DESC").all(req.user.id) as any[];
  res.json(rows.map(r => JSON.parse(r.data)));
});

app.post("/api/calendar", auth, (req: any, res) => {
  const ev = req.body;
  db.prepare("INSERT OR REPLACE INTO calendar_events (id,user_id,data) VALUES (?,?,?)").run(ev.id||`e${Date.now()}`, req.user.id, JSON.stringify(ev));
  res.json({ success: true });
});

app.delete("/api/calendar/:id", auth, (req: any, res) => {
  db.prepare("DELETE FROM calendar_events WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// AI
app.post("/api/ai/advice", auth, async (req: any, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(400).json({ error: "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: req.body.prompt }] })
    });
    const data = await r.json() as any;
    res.json({ text: data.content?.[0]?.text || "ไม่สามารถรับคำแนะนำได้" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ADMIN
app.get("/api/admin/users", adminAuth, (_, res) => {
  res.json(db.prepare("SELECT id,username,role,first_name,last_name,position,affiliation,subscription_status,subscription_expiry,created_at,last_seen FROM users ORDER BY created_at DESC").all());
});

app.post("/api/admin/users", adminAuth, async (req, res) => {
  const { username, password, role, first_name, last_name, position, affiliation, subscription_status, subscription_expiry, notes } = req.body;
  if (!username?.trim()) return res.status(400).json({ error: "กรุณาระบุ username" });
  try {
    const hash = await bcrypt.hash(password || "changeme123", 12);
    const r = db.prepare("INSERT INTO users (username,password,role,first_name,last_name,position,affiliation,subscription_status,subscription_expiry,notes) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(username.trim().toLowerCase(), hash, role||"user", first_name||"", last_name||"", position||"ตัวแทน", affiliation||"", subscription_status||"none", subscription_expiry||null, notes||"");
    res.json({ userId: r.lastInsertRowid, success: true });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return res.status(409).json({ error: "Username ถูกใช้แล้ว" });
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/admin/users/:id", adminAuth, async (req: any, res) => {
  const { role, first_name, last_name, position, affiliation, subscription_status, subscription_expiry, notes, password } = req.body;
  if (password) { const h = await bcrypt.hash(password,12); db.prepare("UPDATE users SET password=? WHERE id=?").run(h, req.params.id); }
  db.prepare("UPDATE users SET role=?,first_name=?,last_name=?,position=?,affiliation=?,subscription_status=?,subscription_expiry=?,notes=? WHERE id=?")
    .run(role||"user", first_name||"", last_name||"", position||"", affiliation||"", subscription_status||"none", subscription_expiry||null, notes||"", req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/users/:id", adminAuth, (req: any, res) => {
  const t: any = db.prepare("SELECT role FROM users WHERE id=?").get(req.params.id);
  if (!t) return res.status(404).json({ error: "ไม่พบ" });
  if (t.role === "owner") return res.status(403).json({ error: "ลบ owner ไม่ได้" });
  db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/admin/clients", adminAuth, (_, res) => {
  const rows = db.prepare("SELECT c.id,c.data,c.updated_at,u.username FROM clients c JOIN users u ON c.user_id=u.id ORDER BY c.updated_at DESC").all() as any[];
  res.json(rows.map(r => ({ ...JSON.parse(r.data), _owner: r.username, _updatedAt: r.updated_at })));
});

app.get("/api/team/data", auth, (req: any, res) => {
  const u: any = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if (!u?.affiliation) return res.json({ users: [], clients: [] });
  const users = db.prepare("SELECT id,username,role,first_name,last_name,position,last_seen FROM users WHERE affiliation=? AND id!=?").all(u.affiliation, req.user.id);
  const ids = (users as any[]).map((x: any) => x.id);
  const clients = ids.length > 0
    ? db.prepare(`SELECT c.data,u.username FROM clients c JOIN users u ON c.user_id=u.id WHERE c.user_id IN (${ids.map(()=>"?").join(",")})`).all(...ids).map((r: any) => ({ ...JSON.parse(r.data), _owner: r.username }))
    : [];
  res.json({ users, clients });
});

// Serve React
const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  app.get("/", (_, res) => res.json({ status: "API running", hint: "Run: npm run build" }));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Thai Life Planner running on port ${PORT}`);
});
