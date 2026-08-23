from pydantic import BaseModel
from typing import List, Optional


class CandidateSearchResult(BaseModel):
    id: int
    user_id: int
    roll_no: str
    name: str
    department: str
    semester: str
    email: str
    bio: Optional[str]
    photo_path: Optional[str]
    skills: List[str]

    class Config:
        from_attributes = True
