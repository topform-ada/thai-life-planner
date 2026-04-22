# Thai Life Planner — Deploy บน Railway

## วิธี Deploy (3 ขั้นตอน)

### 1. อัปโหลดขึ้น GitHub
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOUR/thai-life-planner.git
git push -u origin main
```

### 2. Deploy บน Railway
1. ไปที่ railway.app → New Project → Deploy from GitHub
2. เลือก repo นี้ → Railway detect Dockerfile อัตโนมัติ

### 3. ตั้งค่า Variables ใน Railway Dashboard
| Variable | ค่า |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` |
| `JWT_SECRET` | random string ≥32 ตัว |
| `NODE_ENV` | `production` |

### 4. เพิ่ม Volume
Railway → project → Add Volume → Mount path: `/app/data`

✅ เสร็จ! ได้ URL เช่น `https://thai-life-planner.up.railway.app`

## Login เริ่มต้น
- Username: `admin@thailife.app`
- Password: `admin1234`

> ⚠️ เปลี่ยนรหัสผ่านทันทีหลัง deploy

## Run Local
```bash
npm install
cp .env.example .env   # แก้ไข API keys
npm run dev            # http://localhost:3000
```
