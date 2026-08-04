import urllib.request
import json
import urllib.error

# We need to get a token first
auth_data = json.dumps({"username": "test_employer_2", "password": "Password123!"}).encode("utf-8")
req = urllib.request.Request("http://127.0.0.1:8080/api/users/login/", data=auth_data)
req.add_header("Content-Type", "application/json")

try:
    resp = urllib.request.urlopen(req)
    token = json.loads(resp.read().decode("utf-8"))["access"]
except Exception as e:
    print("Login failed:", e)
    import sys; sys.exit(1)

# Now create a job
payload = {
    "title": "Software Engineer",
    "description": "Great job",
    "location": "Remote",
    "salary_min": None,
    "salary_max": None,
    "category": None,
    "status": "OPEN",
}
job_data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request("http://127.0.0.1:8080/api/jobs/", data=job_data)
req.add_header("Content-Type", "application/json")
req.add_header("Authorization", f"Bearer {token}")

try:
    resp = urllib.request.urlopen(req)
    print("Success:", resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Response:", e.read().decode("utf-8"))
except Exception as e:
    print("Error:", str(e))
