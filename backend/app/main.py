from typing import Dict, List, Set

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


# In-memory like/comment storage (no DB in this demo repo).
# Key: blog id -> set of user ids who liked it.
likes_by_blog: Dict[int, Set[str]] = {}
# Key: blog id -> list of comment dicts.
comments_by_blog: Dict[int, List[Dict]] = {}


class CommentCreate(BaseModel):
    content: str

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


@app.get("/api/author")
def author_information():
    return {
        "name": "Huy",
        "role": "Tác giả / Developer",
        "bio": "Một người thích viết blog kỹ thuật và build những dự án nhỏ gọn, dễ chạy local.",
        "location": "Việt Nam",
        "stack": ["React", "FastAPI", "Vite"],
        "contact": {"email": "huy@example.com"},
        "links": {
            "github": "https://github.com/Huygin2394",
            "facebook": "https://facebook.com/",
        },
    }


@app.get("/api/blogs")
def list_my_blogs(x_user_id: str | None = Header(default=None)):
    """
    List blogs with like info.

    We don't have auth in this demo, so the caller can pass X-User-Id to
    personalize the `liked_by_user` flag and toggle likes.
    """
    user_id = x_user_id or "anonymous"

    # Mock data: "tôi" ở đây được hiểu là Huy.
    # Có thể thay bằng DB hoặc CMS sau.
    blogs = [
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

    # Attach like & comment info.
    result = []
    for blog in blogs:
        blog_id = int(blog["id"])
        liked_users = likes_by_blog.get(blog_id, set())
        result.append(
            {
                **blog,
                "likes_count": len(liked_users),
                "liked_by_user": user_id in liked_users,
                "comments_count": len(comments_by_blog.get(blog_id, [])),
            }
        )
    return result


@app.post("/api/blogs/{blog_id}/like")
def toggle_like(blog_id: int, x_user_id: str | None = Header(default=None)):
    """
    Toggle like for a blog post.

    - If X-User-Id likes the blog: unlike it.
    - If X-User-Id hasn't liked the blog: like it.
    """
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-Id header")

    user_id = x_user_id

    liked_users = likes_by_blog.setdefault(int(blog_id), set())
    if user_id in liked_users:
        liked_users.remove(user_id)
        liked = False
    else:
        liked_users.add(user_id)
        liked = True

    return {
        "blog_id": int(blog_id),
        "liked": liked,
        "likes_count": len(liked_users),
    }


def reset_likes_state() -> None:
    """Test helper: clear in-memory state (likes, comments)."""
    likes_by_blog.clear()
    comments_by_blog.clear()


def _ensure_blog_exists(blog_id: int) -> None:
    """Validate that the requested blog id exists in our mock list."""
    valid_ids = {1, 2, 3}
    if blog_id not in valid_ids:
        raise HTTPException(status_code=404, detail="Blog not found")


@app.get("/api/blogs/{blog_id}/comments")
def list_comments(blog_id: int):
    """
    List comments for a given blog.

    Since this is a demo, comments are stored in-memory only.
    """
    _ensure_blog_exists(int(blog_id))
    return comments_by_blog.get(int(blog_id), [])


@app.post("/api/blogs/{blog_id}/comments")
def add_comment(blog_id: int, payload: CommentCreate, x_user_id: str | None = Header(default=None)):
    """
    Add a new comment for a blog post.

    The caller must provide:
    - Header X-User-Id: identifies the commenter.
    - JSON body with `content`: the comment text.
    """
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-Id header")

    content = (payload.content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Comment content is required")

    blog_id_int = int(blog_id)
    _ensure_blog_exists(blog_id_int)

    comments = comments_by_blog.setdefault(blog_id_int, [])
    comment_id = len(comments) + 1
    comment = {
        "id": comment_id,
        "blog_id": blog_id_int,
        "user_id": x_user_id,
        "content": content,
    }
    comments.append(comment)

    return comment
