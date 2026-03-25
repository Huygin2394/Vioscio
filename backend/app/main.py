from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, List

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


@app.get("/api/posts")
def list_posts() -> Dict[str, List[Dict[str, Any]]]:
    """
    Return blog posts list for Home page.
    If no posts are available, return a sample post.
    """
    posts: List[Dict[str, Any]] = []

    if not posts:
        # Sample data (content is not important for this task)
        posts = [
            {
                "id": "sample-1",
                "title": "Sample Blog Post",
                "excerpt": "This is a sample blog post shown on the Home page.",
                "createdAt": "2026-03-25",
            }
        ]

    return {"posts": posts}
