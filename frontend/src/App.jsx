import { useEffect, useState } from 'react'
import './App.css'
import heroImage from './assets/hero.png'

function App() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

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
  }, [reloadToken])

  return (
    <main className="home">
      <div className="home__hero">
        <div className="home__heroCopy">
          <h1>Welcome to Huy blog</h1>
          <p className="home__tagline">Frontend: React | Backend: FastAPI</p>
          <div className="home__badges" aria-label="Tech stack">
            <span className="badge">React</span>
            <span className="badge">FastAPI</span>
            <span className="badge badge--muted">Vite</span>
          </div>
        </div>

        <div className="home__heroMedia" aria-hidden="true">
          <img className="home__heroImage" src={heroImage} alt="" />
        </div>
      </div>

      <section className="blogs">
        <header className="blogs__header">
          <h2>Các bài blog tôi đã viết</h2>
          <p className="blogs__count" aria-live="polite">
            {loading ? 'Đang tải...' : `${blogs.length} bài viết`}
          </p>
        </header>
        {loading ? (
          <div className="blogs__status blogs__status--loading" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <span>Đang tải danh sách bài viết...</span>
          </div>
        ) : error ? (
          <div className="blogs__status blogs__status--error" role="alert">
            <p className="blogs__statusText">{error}</p>
            <button className="button" type="button" onClick={() => setReloadToken((t) => t + 1)}>
              Thử lại
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <p className="blogs__status blogs__status--empty">Chưa có bài viết.</p>
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
