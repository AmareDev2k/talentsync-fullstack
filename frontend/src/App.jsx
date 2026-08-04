import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import api from './services/api'
import { useAuth } from './context/AuthContext.jsx'

const emptyAuthForm = {
  username: '',
  email: '',
  password: '',
  role: 'JOB_SEEKER',
  headline: '',
  bio: '',
}

const emptyCompanyForm = {
  name: '',
  description: '',
  website: '',
  location: '',
  logo_url: '',
}

const emptyJobForm = {
  title: '',
  description: '',
  location: '',
  salary_min: '',
  salary_max: '',
  category: '',
  status: 'OPEN',
}

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.results ?? []
}

function formatSalary(job) {
  if (job.salary_min && job.salary_max) {
    return `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max).toLocaleString()}`
  }

  if (job.salary_min) {
    return `$${Number(job.salary_min).toLocaleString()}+`
  }

  if (job.salary_max) {
    return `Up to $${Number(job.salary_max).toLocaleString()}`
  }

  return 'Salary not specified'
}

function App() {
  const { user, login, register, logout, sessionError } = useAuth()
  const [guestTab, setGuestTab] = useState('welcome')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const [submitting, setSubmitting] = useState(false)

  const isEmployer = user?.role === 'EMPLOYER'

  const handleAuthChange = (event) => {
    const { name, value } = event.target
    setAuthForm((current) => ({ ...current, [name]: value }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice({ type: '', text: '' })

    try {
      if (guestTab === 'login') {
        await login({ username: authForm.username, password: authForm.password })
        setNotice({ type: 'success', text: 'Logged in successfully.' })
      } else {
        await register({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role,
          headline: authForm.headline,
          bio: authForm.bio,
        })
        setNotice({ type: 'success', text: 'Registration successful! Please sign in.' })
        setGuestTab('login')
      }
    } catch (err) {
      let msg = err.response?.data?.detail || err.response?.data?.error;
      if (!msg && err.response?.data) {
        if (typeof err.response.data === 'object') {
          msg = Object.values(err.response.data).flat().join(' ');
        } else {
          msg = err.response.data;
        }
      }
      msg = msg || 'Authentication failed. Check details.';
      setNotice({ type: 'error', text: msg });
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <main className="shell shell--landing">
        <header className="landing-topbar">
          <div className="brand-group">
            <div className="brand-logo">TS</div>
            <div>
              <h1 className="brand-title">TalentSync</h1>
              <p className="brand-subtitle">Online Job Board & Recruitment Portal</p>
            </div>
          </div>

          <nav className="auth-tab-group">
            <button
              type="button"
              className={guestTab === 'welcome' ? 'tab tab--active' : 'tab'}
              onClick={() => {
                setGuestTab('welcome')
                setNotice({ type: '', text: '' })
              }}
            >
              Welcome
            </button>
            <button
              type="button"
              className={guestTab === 'login' ? 'tab tab--active' : 'tab'}
              onClick={() => {
                setGuestTab('login')
                setNotice({ type: '', text: '' })
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={guestTab === 'register' ? 'tab tab--active' : 'tab'}
              onClick={() => {
                setGuestTab('register')
                setNotice({ type: '', text: '' })
              }}
            >
              Register
            </button>
          </nav>
        </header>

        {guestTab === 'welcome' && (
          <section className="welcome-hero-container">
            <div className="welcome-hero">
              <span className="badge badge--open">Talent Acquisition & Career Platform</span>
              <h2>Connect Top Candidates with Industry Leaders</h2>
              <p className="hero-description">
                TalentSync provides a powerful recruitment platform for employers to build company profiles, post and manage job vacancies, and evaluate applicants — while empowering job seekers to explore opportunities and apply directly.
              </p>

              <div className="hero-cta-buttons">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setAuthForm((prev) => ({ ...prev, role: 'JOB_SEEKER' }))
                    setGuestTab('register')
                  }}
                >
                  Register as Job Seeker
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setAuthForm((prev) => ({ ...prev, role: 'EMPLOYER' }))
                    setGuestTab('register')
                  }}
                >
                  Register as Employer
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setGuestTab('login')}
                >
                  Sign In
                </button>
              </div>
            </div>

            <div className="feature-cards-grid">
              <div className="feature-card">
                <div className="feature-icon">🏢</div>
                <h3>Employer Portal</h3>
                <p>Register your company profile, post, edit & close job listings, and manage applicants for your own vacancies.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔎</div>
                <h3>Job Seeker Dashboard</h3>
                <p>Build a candidate profile, search openings by title or category, select company vacancies, and submit applications.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Live Status Updates</h3>
                <p>Monitor recruitment progression in real-time with status tracking: Applied, Reviewed, Accepted, or Rejected.</p>
              </div>
            </div>
          </section>
        )}

        {(guestTab === 'login' || guestTab === 'register') && (
          <section className="auth-panel-container">
            <div className="auth-card">
              <div className="panel-heading">
                <p className="eyebrow">{guestTab === 'login' ? 'Welcome Back' : 'Create Account'}</p>
                <h2>{guestTab === 'login' ? 'Sign In to TalentSync' : 'Register New Account'}</h2>
                <p className="muted">
                  {guestTab === 'login'
                    ? 'Enter your login details to access your dashboard.'
                    : 'Select your account type and fill in your details below.'}
                </p>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                <label>
                  Username
                  <input
                    type="text"
                    name="username"
                    value={authForm.username}
                    onChange={handleAuthChange}
                    placeholder="Enter username"
                    required
                  />
                </label>

                {guestTab === 'register' && (
                  <label>
                    Email Address
                    <input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthChange}
                      placeholder="name@company.com"
                      required
                    />
                  </label>
                )}

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    placeholder="••••••••"
                    required
                  />
                </label>

                {guestTab === 'register' && (
                  <>
                    <label>
                      Account Type / Role
                      <select name="role" value={authForm.role} onChange={handleAuthChange}>
                        <option value="JOB_SEEKER">Job Seeker — Browse & Apply to Vacancies</option>
                        <option value="EMPLOYER">Employer — Post Jobs & Manage Applicants</option>
                      </select>
                    </label>

                    <label>
                      Professional Headline
                      <input
                        type="text"
                        name="headline"
                        value={authForm.headline}
                        onChange={handleAuthChange}
                        placeholder={
                          authForm.role === 'EMPLOYER'
                            ? 'e.g. Head of Talent Acquisition'
                            : 'e.g. Full-Stack Developer | Python & React'
                        }
                      />
                    </label>

                    <label>
                      Bio & Background
                      <textarea
                        name="bio"
                        value={authForm.bio}
                        onChange={handleAuthChange}
                        rows="3"
                        placeholder="Brief summary of experience or recruitment requirements..."
                      />
                    </label>
                  </>
                )}

                <button className="primary-button" type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : guestTab === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="auth-footer-switch">
                {guestTab === 'login' ? (
                  <p className="muted">
                    Need an account?{' '}
                    <button type="button" className="link-button" onClick={() => setGuestTab('register')}>
                      Register here
                    </button>
                  </p>
                ) : (
                  <p className="muted">
                    Already registered?{' '}
                    <button type="button" className="link-button" onClick={() => setGuestTab('login')}>
                      Sign in here
                    </button>
                  </p>
                )}
              </div>

              {notice.text && <p className={`notice notice--${notice.type}`}>{notice.text}</p>}
              {sessionError && <p className="notice notice--error">{sessionError}</p>}
            </div>
          </section>
        )}
      </main>
    )
  }

  return isEmployer ? (
    <EmployerDashboard user={user} onLogout={logout} />
  ) : (
    <JobSeekerDashboard user={user} onLogout={logout} />
  )
}

function EmployerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('vacancies')
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm)
  const [jobForm, setJobForm] = useState(emptyJobForm)
  const [editingJobId, setEditingJobId] = useState(null)
  const [companyId, setCompanyId] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadEmployerData = useCallback(async () => {
    setLoading(true)

    try {
      const [companyRes, categoryRes, jobsRes, applicationsRes] = await Promise.all([
        api.get('/companies/'),
        api.get('/jobs/categories/'),
        api.get('/jobs/my_jobs/'),
        api.get('/applications/'),
      ])

      const companyList = normalizeList(companyRes.data)
      const ownerCompany = companyList.find((company) => company.owner === user.id)

      setCategories(normalizeList(categoryRes.data))
      setJobs(normalizeList(jobsRes.data))
      setApplications(normalizeList(applicationsRes.data))

      if (ownerCompany) {
        setCompanyId(ownerCompany.id)
        setCompanyForm({
          name: ownerCompany.name || '',
          description: ownerCompany.description || '',
          website: ownerCompany.website || '',
          location: ownerCompany.location || '',
          logo_url: ownerCompany.logo_url || '',
        })
      }
    } catch {
      setStatusMessage('Could not fetch employer records.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    const timerId = setTimeout(() => {
      void loadEmployerData()
    }, 0)

    return () => clearTimeout(timerId)
  }, [loadEmployerData])

  const handleCompanyChange = (event) => {
    const { name, value } = event.target
    setCompanyForm((current) => ({ ...current, [name]: value }))
  }

  const saveCompany = async (event) => {
    event.preventDefault()

    try {
      if (companyId) {
        await api.patch(`/companies/${companyId}/`, companyForm)
        setStatusMessage('Company profile updated successfully.')
      } else {
        const response = await api.post('/companies/', companyForm)
        setCompanyId(response.data.id)
        setStatusMessage('Company profile registered successfully.')
      }

      await loadEmployerData()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Company save failed.'
      setStatusMessage(typeof msg === 'string' ? msg : 'Error saving company profile.')
    }
  }

  const handleJobChange = (event) => {
    const { name, value } = event.target
    setJobForm((current) => ({ ...current, [name]: value }))
  }

  const resetJobForm = () => {
    setJobForm(emptyJobForm)
    setEditingJobId(null)
  }

  const saveJob = async (event) => {
    event.preventDefault()

    if (!companyId) {
      setStatusMessage('Please register a company profile before posting a vacancy.')
      setActiveTab('company')
      return
    }

    const payload = {
      ...jobForm,
      salary_min: jobForm.salary_min === '' ? null : Number(jobForm.salary_min),
      salary_max: jobForm.salary_max === '' ? null : Number(jobForm.salary_max),
      category: jobForm.category === '' ? null : Number(jobForm.category),
    }

    try {
      if (editingJobId) {
        await api.patch(`/jobs/${editingJobId}/`, payload)
        setStatusMessage('Vacancy updated successfully.')
      } else {
        await api.post('/jobs/', payload)
        setStatusMessage('New vacancy posted successfully.')
      }

      resetJobForm()
      await loadEmployerData()
    } catch (err) {
      let msg = err.response?.data?.detail || err.response?.data?.error;
      if (!msg && err.response?.data) {
        if (typeof err.response.data === 'object') {
          msg = Object.values(err.response.data).flat().join(' ');
        } else {
          msg = err.response.data;
        }
      }
      msg = msg || 'Could not save vacancy.';
      setStatusMessage(msg);
    }
  }

  const editJob = (job) => {
    setEditingJobId(job.id)
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
      category: job.category ?? '',
      status: job.status || 'OPEN',
    })
    setActiveTab('vacancies')
  }

  const removeJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this vacancy?')) return

    try {
      await api.delete(`/jobs/${jobId}/`)
      setStatusMessage('Vacancy removed.')
      await loadEmployerData()
    } catch {
      setStatusMessage('Failed to remove vacancy.')
    }
  }

  const toggleJobStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    try {
      await api.patch(`/jobs/${job.id}/`, { status: newStatus })
      setStatusMessage(`Vacancy status updated to ${newStatus}.`)
      await loadEmployerData()
    } catch {
      setStatusMessage('Failed to update vacancy status.')
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/`, { status })
      setStatusMessage(`Application status updated to ${status}.`)
      await loadEmployerData()
    } catch {
      setStatusMessage('Failed to update applicant status.')
    }
  }

  return (
    <main className="shell">
      <Navbar
        user={user}
        onLogout={onLogout}
        activeLabel="Employer Dashboard"
        tabs={[
          { key: 'vacancies', label: `Manage Vacancies (${jobs.length})` },
          { key: 'company', label: companyId ? 'Company Profile' : 'Register Company' },
          { key: 'applicants', label: `Applicants (${applications.length})` },
        ]}
        activeTab={activeTab}
        onTabSelect={setActiveTab}
      />

      {statusMessage && (
        <div className="notice notice--info status-bar">
          <span>{statusMessage}</span>
          <button type="button" className="close-btn" onClick={() => setStatusMessage('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="workspace-card text-center">
          <p className="muted">Loading dashboard details...</p>
        </div>
      ) : (
        <section className="workspace-container">
          {activeTab === 'company' && (
            <div className="workspace-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Company Profile</p>
                  <h2>{companyId ? 'Edit Company Information' : 'Register Company Profile'}</h2>
                  <p className="muted">An active company profile is required to publish job listings.</p>
                </div>
              </div>

              <form className="stack-form" onSubmit={saveCompany}>
                <div className="grid-2">
                  <label>
                    Company Name
                    <input name="name" value={companyForm.name} onChange={handleCompanyChange} placeholder="e.g. Acme Innovations" required />
                  </label>
                  <label>
                    Company Location
                    <input name="location" value={companyForm.location} onChange={handleCompanyChange} placeholder="e.g. New York, NY" />
                  </label>
                </div>

                <div className="grid-2">
                  <label>
                    Website URL
                    <input name="website" value={companyForm.website} onChange={handleCompanyChange} placeholder="https://example.com" />
                  </label>
                  <label>
                    Logo Image URL
                    <input name="logo_url" value={companyForm.logo_url} onChange={handleCompanyChange} placeholder="https://example.com/logo.png" />
                  </label>
                </div>

                <label>
                  Company Description
                  <textarea name="description" value={companyForm.description} onChange={handleCompanyChange} rows="4" placeholder="Overview of company culture, mission, and products..." />
                </label>

                <button className="primary-button" type="submit">
                  {companyId ? 'Save Company Profile' : 'Register Company'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'vacancies' && (
            <div className="workspace-layout">
              <div className="workspace-card form-column">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Posting Editor</p>
                    <h2>{editingJobId ? 'Edit Vacancy' : 'Post New Vacancy'}</h2>
                  </div>
                  {editingJobId && (
                    <button className="ghost-button" type="button" onClick={resetJobForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>

                {!companyId && (
                  <div className="notice notice--error">
                    <span>You must register a company profile before adding vacancies.</span>
                    <button type="button" className="link-button" onClick={() => setActiveTab('company')}>
                      Create Profile Now
                    </button>
                  </div>
                )}

                <form className="stack-form" onSubmit={saveJob}>
                  <div className="grid-2">
                    <label>
                      Job Title
                      <input name="title" value={jobForm.title} onChange={handleJobChange} placeholder="e.g. Senior Software Engineer" required />
                    </label>
                    <label>
                      Location
                      <input name="location" value={jobForm.location} onChange={handleJobChange} placeholder="e.g. Remote / Chicago, IL" required />
                    </label>
                  </div>

                  <label>
                    Job Description
                    <textarea name="description" value={jobForm.description} onChange={handleJobChange} rows="4" placeholder="Responsibilities, required skills, benefits..." required />
                  </label>

                  <div className="grid-3">
                    <label>
                      Minimum Salary
                      <input type="number" name="salary_min" value={jobForm.salary_min} onChange={handleJobChange} placeholder="e.g. 80000" />
                    </label>
                    <label>
                      Maximum Salary
                      <input type="number" name="salary_max" value={jobForm.salary_max} onChange={handleJobChange} placeholder="e.g. 120000" />
                    </label>
                    <label>
                      Category
                      <select name="category" value={jobForm.category} onChange={handleJobChange}>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    Listing Status
                    <select name="status" value={jobForm.status} onChange={handleJobChange}>
                      <option value="OPEN">Open (Accepting Applicants)</option>
                      <option value="CLOSED">Closed (Not Accepting Applicants)</option>
                    </select>
                  </label>

                  <button className="primary-button" type="submit" disabled={!companyId}>
                    {editingJobId ? 'Update Vacancy' : 'Publish Vacancy'}
                  </button>
                </form>
              </div>

              <div className="workspace-card list-column">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Vacancies Directory</p>
                    <h2>Your Job Listings ({jobs.length})</h2>
                  </div>
                </div>

                {jobs.length === 0 ? (
                  <p className="muted">No vacancies posted yet. Fill out the form to list your first job opening.</p>
                ) : (
                  <div className="job-grid">
                    {jobs.map((job) => (
                      <article className="job-card" key={job.id}>
                        <div className="job-card-head">
                          <div>
                            <h3>{job.title}</h3>
                            <p className="muted">
                              {job.location} • {formatSalary(job)}
                            </p>
                          </div>
                          <span className={job.status === 'OPEN' ? 'badge badge--open' : 'badge badge--closed'}>
                            {job.status}
                          </span>
                        </div>

                        <p className="muted">{job.description}</p>

                        <div className="card-meta">
                          <span className="badge badge--neutral">Applicants: {job.applications_count ?? 0}</span>
                        </div>

                        <div className="action-row">
                          <button className="ghost-button" type="button" onClick={() => editJob(job)}>
                            Edit
                          </button>
                          <button className="ghost-button" type="button" onClick={() => toggleJobStatus(job)}>
                            {job.status === 'OPEN' ? 'Close Listing' : 'Re-open Listing'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => removeJob(job.id)}>
                            Remove Vacancy
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="workspace-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Applicant Management</p>
                  <h2>Candidates for Your Openings ({applications.length})</h2>
                </div>
              </div>

              {applications.length === 0 ? (
                <p className="muted">No applications received yet.</p>
              ) : (
                <div className="application-list">
                  {applications.map((app) => (
                    <article className="application-card" key={app.id}>
                      <div className="job-card-head">
                        <div>
                          <h3>{app.applicant_username}</h3>
                          <p className="muted">
                            Applied for: <strong>{app.job_title}</strong> ({app.company_name})
                          </p>
                        </div>
                        <span className={`badge badge--${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="cover-note-box">
                        <p className="cover-label">Cover Note:</p>
                        <p className="cover-text">{app.cover_note || 'No note provided.'}</p>
                      </div>

                      <div className="action-row">
                        <button
                          className="ghost-button"
                          type="button"
                          disabled={app.status === 'REVIEWED'}
                          onClick={() => updateApplicationStatus(app.id, 'REVIEWED')}
                        >
                          Mark Reviewed
                        </button>
                        <button
                          className="ghost-button"
                          type="button"
                          disabled={app.status === 'ACCEPTED'}
                          onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                        >
                          Accept Candidate
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          disabled={app.status === 'REJECTED'}
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                        >
                          Reject Candidate
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

function JobSeekerDashboard({ user, onLogout }) {
  const { updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [companies, setCompanies] = useState([])
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [applications, setApplications] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [applyingJob, setApplyingJob] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [profileForm, setProfileForm] = useState({
    headline: user?.headline || '',
    bio: user?.bio || '',
    email: user?.email || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const loadSeekerData = useCallback(async () => {
    setLoading(true)

    try {
      const params = { status: 'OPEN' }
      if (keyword) params.keyword = keyword

      const [companyRes, jobsRes, applicationsRes, categoryRes] = await Promise.all([
        api.get('/companies/'),
        api.get('/jobs/', { params }),
        api.get('/applications/'),
        api.get('/jobs/categories/'),
      ])

      setCompanies(normalizeList(companyRes.data))
      setJobs(normalizeList(jobsRes.data))
      setApplications(normalizeList(applicationsRes.data))
      setCategories(normalizeList(categoryRes.data))
    } catch {
      setStatusMessage('Could not fetch vacancy listings.')
    } finally {
      setLoading(false)
    }
  }, [keyword])

  useEffect(() => {
    const timerId = setTimeout(() => {
      void loadSeekerData()
    }, 0)

    return () => clearTimeout(timerId)
  }, [loadSeekerData])

  const submitApplication = async (event) => {
    event.preventDefault()
    if (!applyingJob) return

    try {
      await api.post('/applications/', {
        job: applyingJob.id,
        cover_note: coverNote || 'I am interested in applying for this vacancy.',
      })
      setStatusMessage(`Application submitted for ${applyingJob.title}!`)
      setApplyingJob(null)
      setCoverNote('')
      await loadSeekerData()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Application submission failed.'
      setStatusMessage(typeof msg === 'string' ? msg : 'Already applied or invalid request.')
    }
  }

  const withdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return

    try {
      await api.delete(`/applications/${applicationId}/`)
      setStatusMessage('Application withdrawn.')
      await loadSeekerData()
    } catch {
      setStatusMessage('Could not withdraw application.')
    }
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile(profileForm)
      setStatusMessage('Profile updated successfully!')
    } catch {
      setStatusMessage('Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchCompany =
        selectedCompanyId === 'all' || String(job.company) === String(selectedCompanyId)
      const matchCategory =
        !selectedCategory || String(job.category) === String(selectedCategory)
      return matchCompany && matchCategory
    })
  }, [jobs, selectedCompanyId, selectedCategory])

  const selectedCompanyObj = useMemo(() => {
    if (selectedCompanyId === 'all') return null
    return companies.find((c) => String(c.id) === String(selectedCompanyId))
  }, [companies, selectedCompanyId])

  return (
    <main className="shell">
      <Navbar
        user={user}
        onLogout={onLogout}
        activeLabel="Job Seeker Portal"
        tabs={[
          { key: 'browse', label: `Browse Jobs (${filteredJobs.length})` },
          { key: 'companies', label: `Companies (${companies.length})` },
          { key: 'applications', label: `My Applications (${applications.length})` },
          { key: 'profile', label: 'My Profile' },
        ]}
        activeTab={activeTab}
        onTabSelect={setActiveTab}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={(id) => {
          setSelectedCompanyId(id)
          setActiveTab('browse')
        }}
      />

      {statusMessage && (
        <div className="notice notice--info status-bar">
          <span>{statusMessage}</span>
          <button type="button" className="close-btn" onClick={() => setStatusMessage('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="workspace-card text-center">
          <p className="muted">Loading jobs & details...</p>
        </div>
      ) : (
        <section className="workspace-container">
          {activeTab === 'browse' && (
            <div className="workspace-layout">
              <aside className="sidebar">
                <div className="workspace-card">
                  <p className="eyebrow">Search Filters</p>
                  <h3>Refine Vacancies</h3>

                  <div className="filter-group">
                    <label>
                      Keyword Search
                      <input
                        className="search-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Title, skills, location..."
                      />
                    </label>

                    <label>
                      Category Filter
                      <select
                        className="search-input"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="workspace-card">
                  <p className="eyebrow">Company Filter</p>
                  <h3>Select Company</h3>
                  <div className="company-pill-list">
                    <button
                      type="button"
                      className={selectedCompanyId === 'all' ? 'company-chip company-chip--active' : 'company-chip'}
                      onClick={() => setSelectedCompanyId('all')}
                    >
                      All Companies
                    </button>
                    {companies.map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        className={String(selectedCompanyId) === String(comp.id) ? 'company-chip company-chip--active' : 'company-chip'}
                        onClick={() => setSelectedCompanyId(comp.id)}
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="workspace-card list-column">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Open Positions</p>
                    <h2>
                      {selectedCompanyObj
                        ? `Vacancies at ${selectedCompanyObj.name}`
                        : 'All Open Job Vacancies'}
                    </h2>
                  </div>
                  {selectedCompanyId !== 'all' && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setSelectedCompanyId('all')}
                    >
                      Show All Companies
                    </button>
                  )}
                </div>

                {filteredJobs.length === 0 ? (
                  <p className="muted">No open vacancies found matching your search parameters.</p>
                ) : (
                  <div className="job-grid">
                    {filteredJobs.map((job) => {
                      const hasApplied = applications.some((app) => String(app.job) === String(job.id))

                      return (
                        <article className="job-card" key={job.id}>
                          <div className="job-card-head">
                            <div>
                              <h3>{job.title}</h3>
                              <p className="muted">
                                <strong>{job.company_name}</strong> • {job.location} • {formatSalary(job)}
                              </p>
                            </div>
                            <span className="badge badge--open">OPEN</span>
                          </div>

                          <p className="muted">{job.description}</p>

                          <div className="action-row">
                            {hasApplied ? (
                              <span className="badge badge--applied">Already Applied</span>
                            ) : (
                              <button
                                className="primary-button primary-button--small"
                                type="button"
                                onClick={() => setApplyingJob(job)}
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="workspace-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Employers Directory</p>
                  <h2>Registered Companies ({companies.length})</h2>
                </div>
              </div>

              {companies.length === 0 ? (
                <p className="muted">No companies registered yet.</p>
              ) : (
                <div className="company-grid">
                  {companies.map((comp) => (
                    <article className="company-card" key={comp.id}>
                      <div className="company-head">
                        <h3>{comp.name}</h3>
                        <span className="badge badge--neutral">{comp.location || 'Global'}</span>
                      </div>
                      <p className="muted">{comp.description || 'No description provided.'}</p>
                      {comp.website && (
                        <p className="website-link">
                          <a href={comp.website} target="_blank" rel="noreferrer">
                            {comp.website}
                          </a>
                        </p>
                      )}
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setSelectedCompanyId(comp.id)
                          setActiveTab('browse')
                        }}
                      >
                        View Vacancies
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="workspace-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Application Tracker</p>
                  <h2>My Submitted Applications ({applications.length})</h2>
                </div>
              </div>

              {applications.length === 0 ? (
                <p className="muted">You haven't submitted any job applications yet.</p>
              ) : (
                <div className="application-list">
                  {applications.map((app) => (
                    <article className="application-card" key={app.id}>
                      <div className="job-card-head">
                        <div>
                          <h3>{app.job_title}</h3>
                          <p className="muted">Company: <strong>{app.company_name}</strong></p>
                        </div>
                        <span className={`badge badge--${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="cover-note-box">
                        <p className="cover-label">Your Cover Note:</p>
                        <p className="cover-text">{app.cover_note}</p>
                      </div>

                      <div className="action-row">
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => withdrawApplication(app.id)}
                        >
                          Withdraw Application
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="workspace-card max-width-md">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Candidate Profile</p>
                  <h2>Build Your Profile</h2>
                  <p className="muted">Keep your headline and bio updated for employers.</p>
                </div>
              </div>

              <form className="stack-form" onSubmit={handleProfileSubmit}>
                <label>
                  Email Address
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </label>

                <label>
                  Professional Headline
                  <input
                    type="text"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    placeholder="e.g. Senior Software Engineer | React, Node, Python"
                  />
                </label>

                <label>
                  Bio & Professional Summary
                  <textarea
                    rows="5"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Describe your background, skills, and goals..."
                  />
                </label>

                <button className="primary-button" type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {applyingJob && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Apply for {applyingJob.title}</h3>
            <p className="muted">Company: <strong>{applyingJob.company_name}</strong></p>

            <form onSubmit={submitApplication}>
              <label>
                Cover Note
                <textarea
                  rows="4"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                />
              </label>

              <div className="action-row modal-actions">
                <button className="ghost-button" type="button" onClick={() => setApplyingJob(null)}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function Navbar({
  user,
  onLogout,
  activeLabel,
  tabs,
  activeTab,
  onTabSelect,
  companies,
  selectedCompanyId,
  onSelectCompany,
}) {
  return (
    <header className="topbar">
      <div className="topbar-brand-section">
        <div className="brand-group">
          <div className="brand-logo">TS</div>
          <div>
            <h1 className="brand-title">TalentSync</h1>
            <p className="topbar-subtitle">{activeLabel}</p>
          </div>
        </div>

        {tabs && (
          <nav className="topbar-nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeTab === tab.key ? 'nav-tab nav-tab--active' : 'nav-tab'}
                onClick={() => onTabSelect(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Navbar Section for Job Seekers to Select Company Vacancies directly in Navbar */}
      {companies && onSelectCompany && (
        <div className="navbar-company-section">
          <span className="navbar-section-label">Company Vacancies:</span>
          <select
            className="navbar-company-select"
            value={selectedCompanyId || 'all'}
            onChange={(e) => onSelectCompany(e.target.value)}
          >
            <option value="all">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="topbar-actions">
        <span className="badge badge--neutral">{user.role}</span>
        <span className="user-name">{user.username}</span>
        <button type="button" className="ghost-button logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default App