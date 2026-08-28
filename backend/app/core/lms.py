from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, status

from app.config import settings


def _lms_url(path: str) -> str:
    if not settings.LMS_API_URL:
        raise HTTPException(status_code=503, detail="LMS is not configured")
    return f"{settings.LMS_API_URL.rstrip('/')}/{path.lstrip('/')}"


def _student_from_record(record: Dict[str, Any], fallback_email: str = "") -> Dict[str, Any]:
    email = record.get("email") or record.get("login") or fallback_email
    roll_no = record.get("roll_no") or record.get("student_id") or record.get("login") or (email.split("@")[0] if "@" in email else email)
    name = record.get("name") or record.get("username") or roll_no

    department = record.get("department") or record.get("department_name")
    department_value = record.get("department_id")
    if isinstance(department_value, (list, tuple)) and len(department_value) > 1:
        department = department or department_value[1]

    return {
        "lms_id": str(record.get("lms_id") or record.get("id") or record.get("uid") or ""),
        "roll_no": str(roll_no),
        "name": str(name),
        "department": str(department or "General"),
        "semester": str(record.get("semester") or "N/A"),
        "email": email,
    }


async def _jsonrpc_post(path: str, payload: Dict[str, Any], cookies: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=settings.LMS_TIMEOUT_SECONDS) as client:
            response = await client.post(_lms_url(path), json=payload, cookies=cookies)
            response.raise_for_status()
            data = response.json()
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        raise HTTPException(status_code=503, detail="LMS service unavailable") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=503, detail="LMS request failed") from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="LMS returned invalid JSON") from exc

    if data.get("error"):
        error = data["error"]
        message = error.get("data", {}).get("message") or error.get("message") or "LMS request failed"
        raise HTTPException(status_code=401, detail=message)
    return data


async def authenticate_student(email: str, password: str) -> Dict[str, Any]:
    payload = {
        "jsonrpc": "2.0",
        "params": {"db": settings.LMS_DB_NAME, "login": email, "password": password},
    }
    try:
        async with httpx.AsyncClient(timeout=settings.LMS_TIMEOUT_SECONDS) as client:
            response = await client.post(_lms_url(settings.LMS_API_ENDPOINT), json=payload)
            response.raise_for_status()
            data = response.json()
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        raise HTTPException(status_code=503, detail="LMS service unavailable") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=503, detail="LMS authentication request failed") from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="LMS returned invalid JSON") from exc

    if data.get("error"):
        raise HTTPException(status_code=401, detail="Invalid LMS credentials")
    result = data.get("result") or {}
    uid = result.get("uid")
    session_id = response.cookies.get("session_id") or result.get("session_id")
    if not uid or not session_id:
        raise HTTPException(status_code=401, detail="LMS did not return a valid session")

    details = await get_student_details(session_id, uid, fallback_email=email)
    if result.get("username"):
        details["email"] = result["username"]
    if result.get("name"):
        details["name"] = result["name"]

    return {**details, "session_id": session_id}


async def validate_lms_token(lms_token: str) -> Dict[str, Any]:
    if not lms_token:
        raise HTTPException(status_code=400, detail="LMS token required")
    data = await _jsonrpc_post(
        "/web/session/get_session_info",
        {"jsonrpc": "2.0", "method": "call", "params": {}},
        {"session_id": lms_token},
    )
    uid = (data.get("result") or {}).get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid LMS session")
    return await get_student_details(lms_token, uid)


async def get_student_details(session_id: str, uid: Optional[int] = None, fallback_email: str = "") -> Dict[str, Any]:
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {
            "model": settings.LMS_PROFILE_MODEL,
            "method": "search_read",
            "args": [[("id", "=", uid)]] if uid else [[]],
            "kwargs": {"fields": ["id", "name", "email", "login"], "limit": 1},
        },
    }
    try:
        data = await _jsonrpc_post("/web/dataset/call_kw", payload, {"session_id": session_id})
        records = data.get("result") or []
        if records:
            return _student_from_record(records[0], fallback_email)
    except Exception:
        pass

    roll_no = fallback_email.split("@")[0] if "@" in fallback_email else fallback_email
    return {
        "lms_id": str(uid or ""),
        "roll_no": roll_no,
        "name": roll_no,
        "department": "General",
        "semester": "N/A",
        "email": fallback_email,
    }


async def validate_lms_response(lms_response: Dict[str, Any]) -> Dict[str, Any]:
    result = lms_response.get("result") or {}
    uid = result.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid LMS response")
    return await get_student_details(result.get("session_id", ""), uid)