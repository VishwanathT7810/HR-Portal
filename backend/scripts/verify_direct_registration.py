"""End-to-End Verification Script:
1. Health Check
2. Demo Admin Login
3. Direct Public Registration (without token/invitation)
4. Mobile Number Lookup for Editing (auto-fill test)
5. Record Update via Direct Registration
6. Admin Dashboard & Search Verification
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as err:
        err_content = err.read().decode("utf-8")
        return err.code, json.loads(err_content) if err_content else {"error": str(err)}

def main():
    print("=" * 65)
    print("RUNNING END-TO-END VERIFICATION: DIRECT REGISTRATION & EDIT")
    print("=" * 65)

    # 1. Health
    status, res = make_req("/health")
    assert status == 200, f"Health check failed: {status}"
    print("[1] Health Check: OK")

    # 2. Demo Admin Login
    login_data = {
        "username": "demo.admin@example.com",
        "password": "Demo@12345"
    }
    status, res = make_req("/api/v1/auth/login", method="POST", data=login_data)
    assert status == 200 and "access_token" in res, f"Admin login failed: {status} -> {res}"
    admin_token = res["access_token"]
    print(f"[2] Demo Admin Login: OK (Token received)")

    # 3. Direct Public Registration (First Submission)
    test_mobile = "9876543210"
    reg_data_1 = {
        "mobile": test_mobile,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "post": "Senior Software Engineer",
        "date_of_birth": "1995-05-15",
        "gender": "female",
        "local_address": "123 Tech Park, Phase 1",
        "permanent_address": "456 Green Valley",
        "landline": "011-23456789",
        "qualification": "B.Tech Computer Science",
        "computer_course": "Full Stack Web Development",
        "interview_date": "2026-10-01",
        "reference_name": "John Smith",
        "date_of_joining": "2026-11-01",
        "experience_value": 5,
        "experience_unit": "years",
        "emergency_mobile": "9812345678",
        "emergency_person_name": "Mark Doe",
        "emergency_relation": "Brother",
        "blood_group": "O+",
        "willingness_donate_blood": True,
        "marital_status": "single",
        "religion": "General",
        "caste": "NA",
        "spouse_name": "",
        "anniversary_date": None
    }
    status, res1 = make_req("/api/v1/employee/register", method="POST", data=reg_data_1)
    assert status == 201, f"Direct registration failed: {status} -> {res1}"
    ref1 = res1.get("submission_reference")
    assert ref1, "No submission_reference returned"
    print(f"[3] Direct Registration Created: Ref #{ref1}, Name='{res1.get('name')}'")

    # 4. Mobile Lookup (User types their mobile number on returning)
    status, lookup_res = make_req(f"/api/v1/employee/lookup?mobile={test_mobile}")
    assert status == 200, f"Mobile lookup failed: {status} -> {lookup_res}"
    assert lookup_res.get("mobile_number") == test_mobile, "Mobile number mismatch in lookup"
    assert lookup_res.get("name") == "Jane Doe", "Name mismatch in lookup"
    assert lookup_res.get("submission_reference") == ref1, "Reference mismatch in lookup"
    print(f"[4] Mobile Lookup Succeeded: Loaded saved data for '{lookup_res.get('name')}' (Ref #{ref1})")

    # 5. Direct Update (User edits their previously filled data)
    reg_data_2 = dict(reg_data_1)
    reg_data_2["name"] = "Jane Doe-Smith" # Updated name
    reg_data_2["post"] = "Lead Architect"  # Updated post
    reg_data_2["qualification"] = "M.Tech Software Systems" # Updated qualification

    status, res2 = make_req("/api/v1/employee/register", method="POST", data=reg_data_2)
    assert status == 201, f"Update registration failed: {status} -> {res2}"
    assert res2.get("name") == "Jane Doe-Smith", "Updated name not reflected"
    assert res2.get("post") == "Lead Architect", "Updated post not reflected"
    assert res2.get("submission_reference") == ref1, "Submission reference should remain consistent across edits"
    print(f"[5] Direct Update Succeeded: Name='{res2.get('name')}', Post='{res2.get('post')}' (Ref #{res2.get('submission_reference')})")

    # 6. Admin Search & Dashboard Verification
    status, search_res = make_req(f"/api/v1/admin/employees/search?mobile={test_mobile}", token=admin_token)
    assert status == 200 and len(search_res) > 0, f"Admin search failed: {status} -> {search_res}"
    assert search_res[0].get("name") == "Jane Doe-Smith", "Admin search data mismatch"
    print(f"[6] Admin Search Verified: Found updated record in Admin Portal for mobile {test_mobile}")

    status, summary_res = make_req("/api/v1/admin/dashboard/summary", token=admin_token)
    assert status == 200, f"Admin summary failed: {status}"
    print(f"[7] Admin Dashboard Verified: Total Employees = {summary_res.get('totalEmployees')}")

    print("\n" + "=" * 65)
    print("ALL TESTS PASSED! DIRECT REGISTRATION & EDIT WORKFLOW VERIFIED 100%")
    print("=" * 65)

if __name__ == "__main__":
    main()
