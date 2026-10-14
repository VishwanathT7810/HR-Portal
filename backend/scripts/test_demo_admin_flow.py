"""Verification script for Demo Admin Account & API endpoints.
Tests:
1. Health check (GET /health)
2. Login with email: demo.admin@example.com / Demo@12345 (POST /api/v1/auth/login)
3. Access token validation
4. Admin Dashboard Summary (GET /api/v1/admin/dashboard/summary)
5. Create Employee Form Invitation (POST /api/v1/admin/invitations)
6. Verify token is active and valid (GET /api/v1/employee/form/{token})
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8")
        return err.code, json.loads(body) if body else {"error": str(err)}

def main():
    print("=" * 60)
    print("VERIFYING DEMO ADMIN AUTHENTICATION AND API WORKFLOW")
    print("=" * 60)

    # 1. Health check
    status, body = make_request(f"{BASE_URL}/health")
    print(f"\n[1] Health Check: Status={status}, Body={body}")
    assert status == 200, f"Health check failed: {status}"

    # 2. Login with demo admin email
    login_payload = {
        "username": "demo.admin@example.com",
        "password": "Demo@12345"
    }
    print(f"\n[2] Logging in with email: {login_payload['username']} ...")
    status, body = make_request(f"{BASE_URL}/api/v1/auth/login", method="POST", data=login_payload)
    print(f"    Status: {status}")
    assert status == 200, f"Login failed: {status} -> {body}"
    assert "access_token" in body, "No access_token returned"
    assert "refresh_token" in body, "No refresh_token returned"

    access_token = body["access_token"]
    refresh_token = body["refresh_token"]
    print(f"    [SUCCESS] Access token received (length={len(access_token)})")
    print(f"    [SUCCESS] Refresh token received (length={len(refresh_token)})")

    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # 3. Access Dashboard Summary
    print("\n[3] Testing GET /api/v1/admin/dashboard/summary ...")
    status, body = make_request(f"{BASE_URL}/api/v1/admin/dashboard/summary", headers=auth_headers)
    print(f"    Status: {status}")
    print(f"    Summary Data: {json.dumps(body, indent=2)}")
    assert status == 200, f"Dashboard summary failed: {status} -> {body}"
    assert "totalEmployees" in body or "total_employees" in body, "Invalid summary response"

    # 4. Create Employee Form Invitation
    invitation_payload = {
        "mobile_number": "9876543210",
        "valid_days": 7
    }
    print(f"\n[4] Creating employee invitation for mobile: {invitation_payload['mobile_number']} ...")
    status, body = make_request(f"{BASE_URL}/api/v1/admin/invitations", method="POST", data=invitation_payload, headers=auth_headers)
    print(f"    Status: {status}")
    print(f"    Invitation Response: {json.dumps(body, indent=2)}")
    assert status == 201, f"Create invitation failed: {status} -> {body}"
    assert "token" in body, "No token returned in invitation response"

    invitation_token = body["token"]
    expires_at = body.get("expires_at")
    print(f"    [SUCCESS] Generated Invitation Token: {invitation_token}")
    print(f"    [SUCCESS] Token Expires At: {expires_at}")

    # 5. Verify the generated token with the public employee invitation endpoint
    print(f"\n[5] Verifying invitation token via GET /api/v1/employee/form/{invitation_token} ...")
    status, body = make_request(f"{BASE_URL}/api/v1/employee/form/{invitation_token}")
    print(f"    Status: {status}")
    print(f"    Form Token Data: {json.dumps(body, indent=2)}")
    assert status == 200, f"Invitation validation failed: {status} -> {body}"
    assert body.get("token") == invitation_token, "Token mismatch in form info"
    assert body.get("mobileNumber") == "9876543210" or body.get("mobile_number") == "9876543210", "Mobile mismatch"

    print("\n" + "=" * 60)
    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
