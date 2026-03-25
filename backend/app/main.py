from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Huy Blog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Huy blog"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/blogs")
def list_my_blogs():
    # Mock data: "tôi" ở đây được hiểu là Huy.
    # Có thể thay bằng DB hoặc CMS sau.
    return [
        {
            "id": 1,
            "title": "Hello Vioscio: Khởi động project",
            "excerpt": "Ghi lại quá trình dựng frontend React + backend FastAPI và cách chạy local.",
            "created_at": "2026-01-12",
            "author": "Huy",
        },
        {
            "id": 2,
            "title": "Tips tối ưu Vite cho dự án nhỏ",
            "excerpt": "Những mẹo cấu hình để dev/build nhanh và ít rườm rà hơn.",
            "created_at": "2026-02-05",
            "author": "Huy",
        },
        {
            "id": 3,
            "title": "Thiết kế API tối giản với FastAPI",
            "excerpt": "Trình bày cách tổ chức endpoint gọn gàng, dễ mở rộng khi cần auth và dữ liệu thật.",
            "created_at": "2026-03-02",
            "author": "Huy",
        },
    ]
