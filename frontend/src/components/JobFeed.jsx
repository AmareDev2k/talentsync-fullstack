import { useEffect, useState } from 'react'
import api from '../services/api'

function toArray(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.results ?? []
}

function formatSalary(job) {
  if (job.salary_min && job.salary_max) {
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
  }

  if (job.salary_min) {
    return `${job.salary_min.toLocaleString()}+`
  }

  if (job.salary_max) {
    return `Up to ${job.salary_max.toLocaleString()}`
  }

  return 'Salary not listed'
}

export default function JobFeed({ user }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const fetchJobs = async () => {
      setLoading(true)
      setError('')

      try {
        const endpoint = user?.role === 'EMPLOYER' ? '/jobs/my_jobs/' : '/jobs/'
        const response = await api.get(endpoint)

        if (active) {
          setJobs(toArray(response.data))
        }
      } catch (fetchError) {
        if (active) {
          setError('Could not load job data from the backend.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchJobs()

    return () => {
      active = false
    }
  }, [user])

  return (
    <section className="jobs-card">
      <div className="jobs-card-header">
        <div>
          <p className="card-label">Live API check</p>
          <h2>{user?.role === 'EMPLOYER' ? 'Your jobs from Django' : 'Open jobs from Django'}</h2>
        </div>
        <span className="status-pill status-pill--muted">GET /api/jobs/</span>
      </div>

      {loading ? <p className="job-list-empty">Loading jobs from the backend...</p> : null}
      {error ? <p className="feedback feedback--error">{error}</p> : null}

      {!loading && !error && jobs.length === 0 ? (
        <p className="job-list-empty">No jobs were returned by the API yet.</p>
      ) : null}

      <div className="job-list">
        {jobs.map((job) => (
          <article key={job.id} className="job-card">
            <div className="job-card-top">
              <div>
                <p className="job-tag">{job.company_name || 'TalentSync'}</p>
                <h3>{job.title}</h3>
              </div>
              <span className="job-badge">{job.status}</span>
            </div>

            <p className="job-meta">{job.location} • {formatSalary(job)}</p>

            <div className="job-card-meta">
              <span className="status-pill status-pill--idle">
                Category: {job.category_name || 'General'}
              </span>
              {typeof job.applications_count === 'number' ? (
                <span className="job-badge job-badge--warn">
                  {job.applications_count} application{job.applications_count === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>

            <p className="job-meta">{job.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}