import urllib.request
import json

data = json.dumps({
    "username": "test_user_2",
    "email": "test2@example.com",
    "password": "Password123!",
    "role": "JOB_SEEKER",
    "headline": "My headline",
    "bio": "My bio"
}).encode('utf-8')

req = urllib.request.Request("http://127.0.0.1:8080/api/users/register/", data=data)
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
