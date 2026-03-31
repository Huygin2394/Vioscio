import { useEffect, useMemo, useState } from 'react'
import './App.css'
import heroImage from './assets/vite.svg'

function getOrCreateUserId() {
  try {
    const existing = localStorage.getItem('vioscio_user_id')
    if (existing) return existing

    const id = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `u_${Math.random().toString(16).slice(2)}_${Date.now()}`
    localStorage.setItem('vioscio_user_id', id)
    return id
  } catch {
    // Fallback for environments where localStorage/crypto aren't available.
    return `anonymous_${Math.random().toString(16).slice(2)}`
  }
}

function App() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [author, setAuthor] = useState(null)
  const [authorLoading, setAuthorLoading] = useState(false)
  const [authorError, setAuthorError] = useState(null)
  const [authorReloadToken, setAuthorReloadToken] = useState(0)
  const [route, setRoute] = useState(() => (globalThis.location?.hash || '#/').replace('#', ''))
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [])
  const [userId] = useState(() => getOrCreateUserId())

  useEffect(() => {
    function onHashChange() {
      setRoute((globalThis.location?.hash || '#/').replace('#', ''))
    }
    globalThis.addEventListener?.('hashchange', onHashChange)
    onHashChange()
    return () => globalThis.removeEventListener?.('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadBlogs() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${apiBaseUrl}/api/blogs`, {
          signal: controller.signal,
          headers: { 'X-User-Id': userId },
        })
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
  }, [reloadToken, apiBaseUrl, userId])

  useEffect(() => {
    if (route !== '/author') return
    const controller = new AbortController()

    async function loadAuthor() {
      try {
        setAuthorLoading(true)
        setAuthorError(null)
        const res = await fetch(`${apiBaseUrl}/api/author`, { signal: controller.signal })
        if (!res.ok) throw new Error(`Failed to load author: ${res.status}`)
        const data = await res.json()
        setAuthor(data && typeof data === 'object' ? data : null)
      } catch (err) {
        if (err?.name !== 'AbortError') setAuthorError(err?.message || 'Unknown error')
      } finally {
        setAuthorLoading(false)
      }
    }

    loadAuthor()
    return () => controller.abort()
  }, [route, apiBaseUrl, authorReloadToken])

  async function handleToggleLike(blogId) {
    try {
      setError(null)
      const res = await fetch(`${apiBaseUrl}/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      })
      if (!res.ok) throw new Error(`Failed to toggle like: ${res.status}`)
      const data = await res.json()

      setBlogs((prev) =>
        prev.map((blog) => {
          if (blog.id !== data.blog_id) return blog
          return {
            ...blog,
            liked_by_user: Boolean(data.liked),
            likes_count: Number(data.likes_count),
          }
        }),
      )
    } catch (err) {
      setError(err?.message || 'Unknown error')
    }
  }

  async function handleAddComment(blogId) {
    const content = globalThis.prompt?.('Nhập bình luận của bạn:') ?? ''
    if (!content.trim()) return

    try {
      setError(null)
      const res = await fetch(`${apiBaseUrl}/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`)

      setBlogs((prev) =>
        prev.map((blog) => {
          if (blog.id !== blogId) return blog
          const currentCount = Number.isFinite(Number(blog.comments_count)) ? Number(blog.comments_count) : 0
          return {
            ...blog,
            comments_count: currentCount + 1,
          }
        }),
      )
    } catch (err) {
      setError(err?.message || 'Unknown error')
    }
  }

  function renderAuthorPage() {
    return (
      <main className="page">
        <header className="topbar">
          <a className="topbar__brand" href="#/">
            Vioscio
          </a>
          <nav className="topbar__nav">
            <a className="topbar__link" href="#/">
              Home
            </a>
            <a className="topbar__link topbar__link--active" href="#/author" aria-current="page">
              Tác giả
            </a>
          </nav>
        </header>

        <section className="card">
          <div className="card__badge">
            <span className="card__badgeDot" aria-hidden="true" />
            <span className="card__badgeText">Thông tin cá nhân</span>
          </div>
          <h1 className="card__title">Về tác giả</h1>

          {authorLoading ? (
            <div className="statusRow" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <span>Đang tải thông tin...</span>
            </div>
          ) : authorError ? (
            <div className="statusRow statusRow--error" role="alert">
              <p className="statusRow__text">{authorError}</p>
              <button className="button" type="button" onClick={() => setAuthorReloadToken((t) => t + 1)}>
                Thử lại
              </button>
            </div>
          ) : !author ? (
            <p className="muted">Chưa có thông tin tác giả.</p>
          ) : (
            <div className="authorGrid">
              <div className="authorHeader">
                <div className="avatar" aria-hidden="true">
                  {String(author.name || 'H')
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="authorName">{author.name || 'Tác giả'}</h2>
                  <p className="authorRole">{author.role || ''}</p>
                </div>
              </div>

              {author.bio ? <p className="authorBio">{author.bio}</p> : null}

              <div className="authorMeta">
                {author.location ? (
                  <div className="metaItem">
                    <span className="metaLabel">Khu vực</span>
                    <span className="metaValue">{author.location}</span>
                  </div>
                ) : null}
                {Array.isArray(author.stack) && author.stack.length ? (
                  <div className="metaItem">
                    <span className="metaLabel">Tech</span>
                    <div className="metaPills">
                      {author.stack.map((t) => (
                        <span className="pill" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="authorLinks">
                {author.contact?.email ? (
                  <a className="linkButton" href={`mailto:${author.contact.email}`}>
                    Email
                  </a>
                ) : null}
                {author.links?.github ? (
                  <a className="linkButton" href={author.links.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                ) : null}
                {author.links?.facebook ? (
                  <a className="linkButton" href={author.links.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </main>
    )
  }

  if (route === '/author') return renderAuthorPage()

  return (
    <main className="home">
      <div className="hero">
        <div className="hero__inner">
          <div>
            <div className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              <span className="hero__badge-text">Vioscio • Blog</span>
            </div>
            <h1 className="hero__title">Welcome to Huy blog</h1>
            <p className="hero__subtitle">Frontend: React | Backend: FastAPI</p>
            <div className="hero__metaRow" aria-label="Tech stack">
              <span className="pill">React</span>
              <span className="pill">FastAPI</span>
              <span className="pill">Vite</span>
            </div>
            <div className="hero__actions">
              <a className="buttonLink" href="#/author">
                Thông tin tác giả
              </a>
            </div>
          </div>

          <div className="hero__media" aria-hidden="true">
            <img className="hero__image" src={heroImage} alt="" />
          </div>
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

                  <div className="blogs__likeRow">
                    <button
                      type="button"
                      className={`likeButton ${blog.liked_by_user ? 'likeButton--active' : ''}`}
                      aria-pressed={blog.liked_by_user}
                      onClick={() => handleToggleLike(blog.id)}
                    >
                      {blog.liked_by_user ? 'Đã thích' : 'Thích'}
                    </button>
                    <span className="likeCount" aria-label={`${blog.likes_count ?? 0} lượt thích`}>
                      {blog.likes_count ?? 0} ❤️
                    </span>
                    <button
                      type="button"
                      className="button blogs__commentButton"
                      onClick={() => handleAddComment(blog.id)}
                    >
                      Bình luận
                    </button>
                    <span className="commentCount" aria-label={`${blog.comments_count ?? 0} bình luận`}>
                      {blog.comments_count ?? 0} 💬
                    </span>
                  </div>
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
