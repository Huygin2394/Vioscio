from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

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
    # Data in-memory; có thể thay bằng DB/CMS sau.
    return BLOGS


class CreateBlogRequest(BaseModel):
    title: str = Field(..., min_length=1)
    excerpt: Optional[str] = None
    author: Optional[str] = "Huy"


BLOGS = [
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


@app.post("/api/blogs")
def create_blog(payload: CreateBlogRequest):
    # Simple id generation for in-memory storage.
    next_id = max((b["id"] for b in BLOGS), default=0) + 1
    created_at = date.today().isoformat()

    blog = {
        "id": next_id,
        "title": payload.title,
        "excerpt": payload.excerpt,
        "created_at": created_at,
        "author": payload.author or "Huy",
    }
    BLOGS.append(blog)
    return blog
