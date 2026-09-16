import pytest
from pydantic import ValidationError

from app.schemas.student import ExperienceCreateRequest, ExperienceUpdateRequest


def test_experience_end_date_must_be_after_start_date():
    with pytest.raises(ValidationError):
        ExperienceCreateRequest(
            company_name="Example",
            title="Developer",
            start_date="2026-09-09",
            end_date="2026-09-04",
        )


def test_experience_update_rejects_invalid_range_when_both_dates_are_sent():
    with pytest.raises(ValidationError):
        ExperienceUpdateRequest(start_date="2026-09-09", end_date="2026-09-04")
