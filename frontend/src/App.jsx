import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchPosts() {
      try {
        setLoading(true)
        setError('')

        // Backend runs separately; rely on CORS (enabled in FastAPI).
        const res = await fetch('http://localhost:8000/api/posts')
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

        const data = await res.json()
        if (isMounted) setPosts(Array.isArray(data?.posts) ? data.posts : [])
      } catch (e) {
        if (isMounted) setError(e?.message || 'Unknown error')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPosts()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="home">
      <h1>Welcome to Huy blog</h1>
      <p>Frontend: React | Backend: FastAPI</p>

      <section className="posts">
        <h2>Your blog posts</h2>

        {loading && <p className="posts__status">Loading...</p>}
        {error && <p className="posts__status posts__status--error">{error}</p>}

        {!loading && !error && (
          <ul className="posts__list">
            {posts.map((post) => (
              <li key={post.id} className="posts__item">
                <h3 className="posts__title">{post.title}</h3>
                {post.excerpt && <p className="posts__excerpt">{post.excerpt}</p>}
                {post.createdAt && (
                  <p className="posts__meta">Created at: {post.createdAt}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
