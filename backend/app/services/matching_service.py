from typing import Any, Dict, Iterable


def calculate_match_percentage(job_skills: Iterable[Any], student_skills: Iterable[Any]) -> Dict[str, Any]:
    required = []
    required_names = set()
    for skill in job_skills:
        name = str(skill.skill_name or "").strip().lower()
        if name and name not in required_names:
            required.append(skill)
            required_names.add(name)

    student_map = {
        str(skill.skill_name or "").strip().lower(): skill
        for skill in student_skills
        if str(skill.skill_name or "").strip()
    }
    matched = []
    for required_skill in required:
        key = str(required_skill.skill_name or "").strip().lower()
        student_skill = student_map.get(key)
        proficiency = int(student_skill.proficiency_percent or 0) if student_skill else 0
        matched.append({
            "skill_area": required_skill.skill_area,
            "skill_name": required_skill.skill_name,
            "proficiency_percent": proficiency,
            "matched": student_skill is not None,
        })
    matched_count = sum(1 for item in matched if item["matched"])
    percentage = round((matched_count / len(required)) * 100) if required else 0
    return {"match_percentage": percentage, "matched_skills": matched}
