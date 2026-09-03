from typing import Any, Dict, Iterable


def calculate_match_percentage(job_skills: Iterable[Any], student_skills: Iterable[Any]) -> Dict[str, Any]:
    required = list(job_skills)
    student_map = {
        (str(skill.skill_area or "").strip().lower(), str(skill.skill_name).strip().lower()): skill
        for skill in student_skills
    }
    matched = []
    for required_skill in required:
        key = (str(required_skill.skill_area or "").strip().lower(), str(required_skill.skill_name).strip().lower())
        student_skill = student_map.get(key)
        proficiency = int(student_skill.proficiency_percent or 0) if student_skill else 0
        matched.append({
            "skill_area": required_skill.skill_area,
            "skill_name": required_skill.skill_name,
            "proficiency_percent": proficiency,
            "matched": student_skill is not None,
        })
    percentage = round(sum(item["proficiency_percent"] for item in matched) / len(matched)) if matched else 0
    return {"match_percentage": percentage, "matched_skills": matched}