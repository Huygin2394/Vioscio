# Huy Blog (React + FastAPI)

Codebase fullstack don gian:
- Frontend: React (Vite)
- Backend: FastAPI

## Cấu trúc

```text
.
├── frontend/   # React app
└── backend/    # FastAPI app
```

## Chạy backend (FastAPI)

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API:
- `GET /` -> Welcome to Huy blog API
- `GET /api/health` -> status ok

## Chạy frontend (React)

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Mở trình duyệt: `http://localhost:5173`

Trang Home hiển thị: **Welcome to Huy blog**.

## Technical Blog Articles (English)

Added three English technical blog posts under `docs/blog/`:

- `docs/blog/cursor-internal-techniques.md`
- `docs/blog/swe-agent-aci-explained.md`
- `docs/blog/devin-technical-architecture-explained.md`
