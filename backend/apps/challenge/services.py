# challenge/services.py
import requests
from typing import Dict, Any, List

SOLVEDAC_BASE_URL = "https://solved.ac/api/v3"

DEFAULT_HEADERS = {
    "User-Agent": "dororo-lms/1.0",
    "Accept": "application/json",
}


class SolvedAcAPIError(Exception):
    """solved.ac 호출 관련 커스텀 예외"""
    pass


def fetch_solvedac_user(handle: str) -> Dict[str, Any]:
    """
    solved.ac /user/show API 호출해서 유저 정보 가져오기.
    - handle: solved.ac 아이디 (백준 아이디와 동일)
    """
    url = f"{SOLVEDAC_BASE_URL}/user/show"

    resp = requests.get(
        url,
        params={"handle": handle},
        headers=DEFAULT_HEADERS,
        timeout=3,
    )

    if resp.status_code != 200:
        raise SolvedAcAPIError(f"solved.ac returned {resp.status_code}")

    data = resp.json()

    # 방어적으로 items 래핑 처리
    if isinstance(data, dict) and "items" in data:
        items = data.get("items") or []
        if not items:
            raise SolvedAcAPIError("solved.ac: user not found")
        return items[0]

    return data


def fetch_solvedac_solved_problems(handle: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    이 유저가 푼 문제들 중 일부 가져오기.
    - 진짜 '최근' 순서는 API가 안 주니까, level 높은 순으로 정렬해서 일부만 사용.
    """
    if not handle:
        return []

    url = f"{SOLVEDAC_BASE_URL}/search/problem"
    params = {
        "query": f"solved_by:{handle}",
        "sort": "level",
        "direction": "desc",
        "page": 1,
    }

    resp = requests.get(
        url,
        params=params,
        headers=DEFAULT_HEADERS,
        timeout=3,
    )

    if resp.status_code != 200:
        return []

    data = resp.json()
    items = data.get("items", [])[:limit]

    problems: List[Dict[str, Any]] = []
    for item in items:
        problems.append(
            {
                "problem_id": item.get("problemId"),
                "title": item.get("titleKo"),
                "level": item.get("level"),
            }
        )
    return problems


def build_challenge_payload(user: dict) -> dict:
    """
    solved.ac user JSON → 그대로 매핑만 함.
    계산/추측 일절 없음.
    """
    handle = user.get("handle")
    solved_count = user.get("solvedCount", 0)

    class_level = user.get("class", None)
    class_decoration = user.get("classDecoration", None)

    arena_rating = user.get("arenaRating", 0)
    arena_tier = user.get("arenaTier", 0)
    arena_max_rating = user.get("arenaMaxRating", 0)
    arena_max_tier = user.get("arenaMaxTier", 0)
    arena_competed_round_count = user.get("arenaCompetedRoundCount", 0)

    max_streak = user.get("maxStreak", 0)

    recent_solved = fetch_solvedac_solved_problems(handle, limit=5)

    return {
        "handle": handle,
        "profile_image_url": user.get("profileImageUrl"),
        "tier": user.get("tier", 0),
        "rating": user.get("rating", 0),

        "solved_count": solved_count,

        "class_level": class_level,
        "class_decoration": class_decoration,

        "arena": {
            "rating": arena_rating,
            "tier": arena_tier,
            "max_rating": arena_max_rating,
            "max_tier": arena_max_tier,
            "competed_round_count": arena_competed_round_count,
        },

        # 오직 maxStreak 하나만 보냄
        "streak": {
            "max": max_streak,
        },

        # search/problem 에서 가져온 거
        "recent_solved_problems": recent_solved,
    }
