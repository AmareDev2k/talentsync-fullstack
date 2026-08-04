import { useMemo, useState } from 'react'
import './App.css'
import JobFeed from './components/JobFeed.jsx'
import { useAuth } from './context/AuthContext.jsx'

const initialFormState = {
  username: '',
  email: '',
  password: '',
  role: 'JOB_SEEKER',
  headline: '',
  bio: '',
}

function App() {
  const { user, loading, login, register, logout, sessionError } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialFormState)
  const [statusMessage, setStatusMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const authTitle = useMemo(
    () => {
      if (user) {
        return `Session active for ${user.username}`
      }

      return mode === 'login' ? 'Sign in to TalentSync' : 'Create your account'
    },
    [mode, user],
  )

  const endpointSummary = [
    { label: 'Login', value: '/api/users/login/' },
    { label: 'Refresh', value: '/api/users/login/refresh/' },
    { label: 'Profile', value: '/api/users/me/' },
    { label: 'Jobs', value: '/api/jobs/' },
  ]

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatusMessage('')

    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password })
        setStatusMessage('Signed in successfully. Your JWT is now attached to API calls.')
      } else {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          headline: form.headline,
          bio: form.bio,
        })
        setStatusMessage('Account created. Sign in with the same credentials to continue.')
        setMode('login')
      }
    } catch (error) {
      setStatusMessage(error?.response?.data?.detail || error?.message || 'Could not reach the backend API.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setStatusMessage('')
  }

  return (
    <main className="app-shell">
      <section className="dashboard-grid">
        <section className="hero-card">
          <div className="eyebrow">React + Django REST + Supabase PostgreSQL</div>
          <h1>Frontend to backend, connected through JWT and CORS.</h1>
          <p className="hero-copy">
            This Vite app talks directly to the Django API, restores sessions with SimpleJWT,
            and fetches live job data from the backend you already seeded.
          </p>

          <div className="endpoint-grid">
            {endpointSummary.map((item) => (
              <div key={item.label} className="endpoint-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="status-row">
            <span className={`status-pill ${user ? 'status-pill--live' : 'status-pill--idle'}`}>
              {user ? `Signed in as ${user.username}` : 'Ready to authenticate'}
            </span>
            <span className="status-pill status-pill--muted">Backend base URL: http://localhost:8000/api</span>
          </div>

          <div className="detail-grid">
            <article>
              <h2>What is wired up</h2>
              <p>Axios interceptor attaches <code>Authorization: Bearer &lt;token&gt;</code> on each request.</p>
            </article>
            <article>
              <h2>Session restore</h2>
              <p>Saved access tokens are checked against <code>/users/me/</code> on page load.</p>
            </article>
            <article>
              <h2>Role support</h2>
              <p>Registration accepts employer or job seeker roles, matching your Django user model.</p>
            </article>
          </div>
        </section>

        <section className="panel-stack">
          <section className="auth-card">
            <div className="card-header">
              <div>
                <p className="card-label">Authentication</p>
                <h2>{authTitle}</h2>
              </div>
              {user ? (
                <button type="button" className="ghost-button" onClick={logout}>
                  Logout
                </button>
              ) : null}
            </div>

            <div className="mode-switch">
              <button
                type="button"
                className={mode === 'login' ? 'mode-button mode-button--active' : 'mode-button'}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'mode-button mode-button--active' : 'mode-button'}
                onClick={() => switchMode('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="sarah_recruiter"
                  autoComplete="username"
                  required
                />
              </label>

              {mode === 'register' ? (
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="sarah@techcorp.com"
                    autoComplete="email"
                    required
                  />
                </label>
              ) : null}

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </label>

              {mode === 'register' ? (
                <>
                  <label>
                    Role
                    <select name="role" value={form.role} onChange={handleChange}>
                      <option value="JOB_SEEKER">Job seeker</option>
                      <option value="EMPLOYER">Employer</option>
                    </select>
                  </label>

                  <label>
                    Headline
                    <input
                      name="headline"
                      value={form.headline}
                      onChange={handleChange}
                      placeholder="Senior Django engineer"
                    />
                  </label>

                  <label>
                    Bio
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Short profile summary"
                      rows="4"
                    />
                  </label>
                </>
              ) : null}

              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? 'Working...' : mode === 'login' ? 'Login and load profile' : 'Create account'}
              </button>
            </form>

            {statusMessage ? <p className="feedback feedback--info">{statusMessage}</p> : null}
            {sessionError ? <p className="feedback feedback--error">{sessionError}</p> : null}
          </section>

          <section className="profile-card">
            <div className="card-header">
              <div>
                <p className="card-label">Current session</p>
                <h2>{loading ? 'Restoring...' : user ? 'Authenticated user' : 'Not signed in'}</h2>
              </div>
            </div>

            {user ? (
              <dl className="profile-list">
                <div>
                  <dt>Username</dt>
                  <dd>{user.username}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{user.role}</dd>
                </div>
                <div>
                  <dt>Headline</dt>
                  <dd>{user.headline || 'No headline yet'}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted-copy">
                Sign in or register to see the authenticated profile data returned by <code>/api/users/me/</code>.
              </p>
            )}
          </section>

          <JobFeed user={user} />
        </section>
      </section>
    </main>
  )
}

export default App
