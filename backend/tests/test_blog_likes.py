from fastapi.testclient import TestClient

from backend.app import main


client = TestClient(main.app)


def setup_function():
    # Ensure tests don't leak in-memory likes across test cases.
    main.reset_likes_state()


def test_list_blogs_initial_likes_empty():
    res = client.get("/api/blogs", headers={"X-User-Id": "u1"})
    assert res.status_code == 200

    data = res.json()
    blog1 = next((b for b in data if b["id"] == 1), None)
    assert blog1 is not None
    assert blog1["likes_count"] == 0
    assert blog1["liked_by_user"] is False


def test_toggle_like_like_and_unlike():
    headers = {"X-User-Id": "u1"}

    res1 = client.post("/api/blogs/1/like", headers=headers)
    assert res1.status_code == 200
    body1 = res1.json()
    assert body1["blog_id"] == 1
    assert body1["liked"] is True
    assert body1["likes_count"] == 1

    res2 = client.get("/api/blogs", headers=headers)
    assert res2.status_code == 200
    blog1 = next((b for b in res2.json() if b["id"] == 1), None)
    assert blog1 is not None
    assert blog1["liked_by_user"] is True
    assert blog1["likes_count"] == 1

    res3 = client.post("/api/blogs/1/like", headers=headers)
    assert res3.status_code == 200
    body3 = res3.json()
    assert body3["liked"] is False
    assert body3["likes_count"] == 0

    res4 = client.get("/api/blogs", headers=headers)
    assert res4.status_code == 200
    blog1 = next((b for b in res4.json() if b["id"] == 1), None)
    assert blog1 is not None
    assert blog1["liked_by_user"] is False
    assert blog1["likes_count"] == 0


def test_toggle_like_multiple_users_accumulates_like_count():
    headers_u1 = {"X-User-Id": "u1"}
    headers_u2 = {"X-User-Id": "u2"}

    res1 = client.post("/api/blogs/1/like", headers=headers_u1)
    assert res1.status_code == 200
    assert res1.json()["likes_count"] == 1

    res2 = client.post("/api/blogs/1/like", headers=headers_u2)
    assert res2.status_code == 200
    assert res2.json()["liked"] is True
    assert res2.json()["likes_count"] == 2

    res3 = client.get("/api/blogs", headers=headers_u1)
    assert res3.status_code == 200
    blog1_u1 = next((b for b in res3.json() if b["id"] == 1), None)
    assert blog1_u1 is not None
    assert blog1_u1["liked_by_user"] is True
    assert blog1_u1["likes_count"] == 2


def test_toggle_like_requires_x_user_id_header():
    res = client.post("/api/blogs/1/like")
    assert res.status_code == 400
    assert res.json()["detail"] == "Missing X-User-Id header"

