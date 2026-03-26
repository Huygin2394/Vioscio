import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createTitle, setCreateTitle] = useState('')
  const [createExcerpt, setCreateExcerpt] = useState('')
  const [createAuthor, setCreateAuthor] = useState('Huy')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const controller = new AbortController()

    async function loadBlogs() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${apiBaseUrl}/api/blogs`, { signal: controller.signal })
        if (!res.ok) throw new Error(`Failed to load blogs: ${res.status}`)

        const data = await res.json()
        setBlogs(Array.isArray(data) ? data : [])
      } catch (err) {
        // Ignore abort errors; show others.
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()

    return () => controller.abort()
  }, [])

  async function createBlog(e) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const payload = {
      title: createTitle.trim(),
      excerpt: createExcerpt.trim() || undefined,
      author: createAuthor.trim() || undefined,
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Failed to create blog: ${res.status}`)
      }

      const created = await res.json()
      setBlogs((prev) => {
        // Keep UI snappy; backend stores by appending to the end.
        if (created && typeof created === 'object') return [...prev, created]
        return prev
      })
      setCreateTitle('')
      setCreateExcerpt('')
      // Keep default author; user can edit it if needed.
    } catch (err) {
      setCreateError(err?.message || 'Unknown error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="home">
      <h1>Welcome to Huy blog</h1>
      <p>Frontend: React | Backend: FastAPI</p>

      <section className="blogs">
        <h2>Các bài blog tôi đã viết</h2>
        <form className="createBlog" onSubmit={createBlog}>
          <h3 className="createBlog__title">Tạo bài blog mới</h3>

          <label className="createBlog__field">
            <span className="createBlog__label">Tiêu đề</span>
            <input
              className="createBlog__input"
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              required
              minLength={1}
              placeholder="Ví dụ: Tips tối ưu Vite cho dự án nhỏ"
            />
          </label>

          <label className="createBlog__field">
            <span className="createBlog__label">Excerpt (tuỳ chọn)</span>
            <textarea
              className="createBlog__textarea"
              value={createExcerpt}
              onChange={(e) => setCreateExcerpt(e.target.value)}
              placeholder="Mô tả ngắn cho bài blog..."
              rows={3}
            />
          </label>

          <label className="createBlog__field">
            <span className="createBlog__label">Tác giả (tuỳ chọn)</span>
            <input
              className="createBlog__input"
              type="text"
              value={createAuthor}
              onChange={(e) => setCreateAuthor(e.target.value)}
              placeholder="Huy"
            />
          </label>

          {createError ? <p className="createBlog__error">{createError}</p> : null}

          <button className="createBlog__button" type="submit" disabled={creating}>
            {creating ? 'Đang tạo...' : 'Tạo blog'}
          </button>
        </form>

        {loading ? (
          <p className="blogs__status">Đang tải...</p>
        ) : error ? (
          <p className="blogs__status blogs__status--error">{error}</p>
        ) : blogs.length === 0 ? (
          <p className="blogs__status">Chưa có bài viết.</p>
        ) : (
          <ul className="blogs__list">
            {blogs.map((blog) => (
              <li key={blog.id} className="blogs__item">
                <article>
                  <h3 className="blogs__title">{blog.title}</h3>
                  {blog.excerpt ? <p className="blogs__excerpt">{blog.excerpt}</p> : null}
                  {blog.created_at ? (
                    <p className="blogs__meta">
                      Đăng lúc <time dateTime={blog.created_at}>{blog.created_at}</time>
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
