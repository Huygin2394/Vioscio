from fastapi.testclient import TestClient

from app import main


client = TestClient(main.app)


def setup_function():
  # Ensure tests don't leak in-memory state across test cases.
  main.reset_likes_state()


def test_list_comments_initially_empty():
  res = client.get("/api/blogs/1/comments")
  assert res.status_code == 200
  assert res.json() == []


def test_add_comment_requires_user_header():
  res = client.post("/api/blogs/1/comments", json={"content": "Xin chao"})
  assert res.status_code == 400
  assert res.json()["detail"] == "Missing X-User-Id header"


def test_add_comment_requires_non_empty_content():
  headers = {"X-User-Id": "u1"}
  res = client.post("/api/blogs/1/comments", headers=headers, json={"content": "   "})
  assert res.status_code == 400
  assert res.json()["detail"] == "Comment content is required"


def test_add_and_list_comments_for_blog():
  headers = {"X-User-Id": "u1"}

  res1 = client.post("/api/blogs/1/comments", headers=headers, json={"content": "Bai viet rat hay"})
  assert res1.status_code == 200
  c1 = res1.json()
  assert c1["id"] == 1
  assert c1["blog_id"] == 1
  assert c1["user_id"] == "u1"
  assert c1["content"] == "Bai viet rat hay"

  res2 = client.get("/api/blogs/1/comments")
  assert res2.status_code == 200
  comments = res2.json()
  assert isinstance(comments, list)
  assert len(comments) == 1
  assert comments[0]["content"] == "Bai viet rat hay"


def test_comments_count_in_list_blogs_response():
  headers = {"X-User-Id": "u1"}

  res1 = client.post("/api/blogs/1/comments", headers=headers, json={"content": "Cmt 1"})
  assert res1.status_code == 200

  res2 = client.post("/api/blogs/1/comments", headers=headers, json={"content": "Cmt 2"})
  assert res2.status_code == 200

  res_blogs = client.get("/api/blogs", headers=headers)
  assert res_blogs.status_code == 200
  blogs = res_blogs.json()
  blog1 = next((b for b in blogs if b["id"] == 1), None)
  assert blog1 is not None
  assert blog1["comments_count"] == 2


def test_comment_404_for_unknown_blog():
  headers = {"X-User-Id": "u1"}

  res_list = client.get("/api/blogs/999/comments")
  assert res_list.status_code == 404
  assert res_list.json()["detail"] == "Blog not found"

  res_post = client.post("/api/blogs/999/comments", headers=headers, json={"content": "Xin chao"})
  assert res_post.status_code == 404
  assert res_post.json()["detail"] == "Blog not found"

