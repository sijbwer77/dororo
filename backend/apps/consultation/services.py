from dataclasses import dataclass
import json
import os
from urllib import request, error


@dataclass
class SuggestionResult:
    category: str | None
    message: str | None


def _keyword_match(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(kw.lower() in lower for kw in keywords)


def _google_llm(text: str) -> tuple[SuggestionResult | None, str | None]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None, "GOOGLE_API_KEY not set"

    system_prompt = (
        "당신은 친절한 상담사입니다. 사용자의 메시지를 보고 간결한 안내와 다음 단계, "
        "확인이 필요한 정보가 있다면 물어봐 주세요. 끝에 '이 안내로 해결되셨나요?'라는 "
        "문구로 확인을 요청하세요."
    )

    model = os.getenv("GOOGLE_GENAI_MODEL", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": text}],
            }
        ],
        "generation_config": {
            "temperature": 0.4,
            "max_output_tokens": 256,
        },
    }

    req = request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with request.urlopen(req, timeout=15) as resp:
            body = resp.read()
        data = json.loads(body.decode())
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            texts = [p.get("text", "") for p in parts if p.get("text")]
            content = "\n".join(t.strip() for t in texts if t.strip())
            if content:
                return SuggestionResult(category="LLM", message=content), None
    except Exception as e:
        print("[LLM] google genai 호출 실패:", e, flush=True)
        err_body = None
        if isinstance(e, error.HTTPError):
            try:
                err_body = e.read().decode()
                print("[LLM] HTTPError body:", err_body, flush=True)
            except Exception:
                pass
        return None, err_body or str(e)

    return None, "LLM 응답이 비어 있습니다."


def _openai_llm(text: str) -> tuple[SuggestionResult | None, str | None]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None, "OPENAI_API_KEY not set"

    payload = {
        "model": os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
        "messages": [
            {
                "role": "system",
                "content": (
                    "당신은 친절한 상담사입니다. 사용자의 메시지를 보고 간결한 안내와 다음 단계, "
                    "확인이 필요한 정보가 있다면 물어봐 주세요. 끝에 '이 안내로 해결되셨나요?'라는 "
                    "문구로 확인을 요청하세요."
                ),
            },
            {"role": "user", "content": text},
        ],
        "max_tokens": 200,
        "temperature": 0.4,
    }

    req = request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    try:
        with request.urlopen(req, timeout=15) as resp:
            body = resp.read()
        data = json.loads(body.decode())
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if content:
            return SuggestionResult(category="LLM", message=content), None
    except Exception as e:
        print("[LLM] openai chat 호출 실패:", e, flush=True)
        err_body = None
        if isinstance(e, error.HTTPError):
            try:
                err_body = e.read().decode()
                print("[LLM] HTTPError body:", err_body, flush=True)
            except Exception:
                pass
        return None, err_body or str(e)

    return None, "LLM 응답이 비어 있습니다."


RULES = [
    ("결제 관련 문의", [
        "결제", "결재", "카드", "승인", "출금", "이체", "간편결제", "계좌이체",
        "안 돼", "안되", "오류", "실패", "이중", "두 번", "중복", "막혔", "한도",
        "결제가 안 돼", "결제가 안되", "결제 오류", "결제 실패",
        "이중 결제", "두 번 결제", "중복 결제",
        "승인이 안나", "카드가 막혔",
    ]),
    ("환불/취소 문의", [
        "환불", "취소", "취소해", "취소요", "결제 취소", "환불해주세요", "돈 돌려",
        "승인 취소", "입금 취소", "취소가 안 돼", "취소가 안되", "철회",
    ]),
    ("정기결제/구독 문의", [
        "정기결제", "자동결제", "정기 결제", "자동 결제", "구독료", "매달 결제", "자동으로 결제",
        "구독", "구독 취소", "정기결제 해지", "구독 해지", "자동결제 멈춰", "구독 해제", "구독 중단",
    ]),
    ("로그인/계정 문의", [
        "로그인", "접속이 안 돼", "접속이 안되", "로그인이 안돼", "접속 오류",
        "아이디", "계정", "비밀번호", "비번", "인증번호", "본인인증",
        "잠겼", "잠김", "로그아웃", "자동 로그인", "2fa", "otp",
    ]),
    ("회원정보/개인정보 문의", [
        "이름 변경", "휴대폰 번호", "전화번호", "주소 변경", "이메일 변경",
        "회원 정보", "개인정보", "탈퇴", "회원탈퇴", "계정 삭제",
    ]),
    ("이용 방법 문의", [
        "어떻게 쓰", "어떻게 이용", "사용법", "이용 방법",
        "어디서 보나요", "어디에서 확인", "설정하는 법", "기능이 뭐예요", "메뉴가 어디",
    ]),
    ("오류/장애 문의", [
        "오류", "에러", "버그", "장애", "멈춰요", "튕겨요", "강제 종료",
        "화면이 안 떠", "로딩만", "깨져 보", "페이지가 안 열려",
        "서버 에러", "500", "404",
    ]),
    ("이벤트/쿠폰/포인트 문의", [
        "이벤트", "프로모션", "응모", "당첨",
        "쿠폰", "할인 코드", "할인코드", "할인쿠폰", "적용이 안 돼", "적용이 안되",
        "포인트", "마일리지", "적립금", "리워드",
    ]),
    ("배송 문의", [
        "배송", "발송", "택배", "운송장", "송장", "배송이 안 와", "배송이 안와", "언제 오나요",
        "배송 상태", "배송지 변경", "수령지 변경",
    ]),
    ("수업 내용 문의", [
        "수업 내용", "강의 내용", "강의가 이해가 안", "이해가 안 돼", "이해가 안되",
        "진도가 어디까지", "어디까지 했나요", "다음 시간에 뭐 해요",
        "설명 다시", "예시 더", "개념이 헷갈려",
    ]),
    ("과제/리포트 문의", [
        "과제", "레포트", "리포트", "숙제",
        "과제 제출", "제출 기한", "마감 언제", "마감 시간",
        "양식", "분량", "형식", "파일 형식", "표지", "텍스트 양식",
    ]),
    ("시험/퀴즈 문의", [
        "시험", "중간고사", "기말고사", "퀴즈",
        "시험 범위", "시험 날짜", "시험 시간", "시험 방식",
        "오픈북", "시험 재응시", "재시험", "시험 난이도",
    ]),
    ("성적/출석 문의", [
        "성적", "점수", "평가", "채점",
        "출석", "지각", "결석", "출결",
        "성적 정정", "점수 정정", "성적이 이상", "점수가 이상",
    ]),
    ("수강신청/분반 문의", [
        "수강 신청", "수강신청", "신청이 안 돼", "신청이 안되", "신청 오류",
        "분반", "반 변경", "다른 반", "다른 시간대",
        "시간표", "시간이 겹쳐", "중복 수강",
    ]),
    ("강의자료/녹화본 문의", [
        "강의 자료", "수업 자료", "ppt", "슬라이드", "자료가 안 떠", "자료가 안떠",
        "녹화본", "강의 영상", "다시보기", "vod", "업로드 안 됨", "업로드 안됨", "업로드 안돼",
        "lms", "e-class", "온라인 강의실", "플랫폼 접속", "강의실",
    ]),
    ("조별과제/팀프로젝트 문의", [
        "조별과제", "팀플", "팀 프로젝트", "프로젝트", "팀",
        "조 편성", "팀 배정", "팀원", "팀원이 안 나와", "팀원이 안나와", "팀원 연락",
        "발표", "발표 순서", "발표 기준", "발표 평가",
    ]),
    ("진로/학습 상담", [
        "진로", "진학", "취업", "전공 선택",
        "어떤 과목을 들어야", "수업 추천", "이수 체계", "필수 과목", "선택 과목",
        "탐구 방향", "연구 주제",
    ]),
]

TEMPLATES = {
    "결제 관련 문의": "결제 오류/중복 결제는 카드사 승인 상태를 먼저 확인해 주세요. 문제가 지속되면 결제 일시, 사용 카드, 오류 화면을 남겨 주시면 확인 후 처리하겠습니다.",
    "환불/취소 문의": "환불/취소는 결제 수단과 시점에 따라 절차가 다릅니다. 결제 일시와 금액, 사용 수단을 알려주시면 처리 방법과 예상 소요 시간을 안내드릴게요.",
    "정기결제/구독 문의": "정기결제/구독 해지는 결제 주기 전 해지 시 다음 결제는 진행되지 않습니다. 구독 관리 메뉴에서 해지하거나, 구독 ID를 알려주시면 대신 처리해드릴게요.",
    "로그인/계정 문의": "로그인 문제가 있다면 비밀번호 재설정과 브라우저/앱 재시도를 먼저 부탁드립니다. 계속 안 되면 아이디, 최근 접속 시간, 오류 메시지를 알려주세요.",
    "회원정보/개인정보 문의": "회원정보 변경은 마이페이지 > 정보 수정에서 가능합니다. 특정 항목 변경/삭제가 필요하면 수정이 필요한 항목과 이유를 알려주세요.",
    "이용 방법 문의": "사용법/메뉴 위치가 궁금하다면 필요한 기능을 알려주세요. 경로와 스크린샷을 포함해 안내드리겠습니다.",
    "오류/장애 문의": "오류가 발생하면 캡처, 발생 시각, 사용 환경(브라우저/OS), 재현 과정을 알려주세요. 우선 캐시/재로그인 후 재시도도 부탁드립니다.",
    "이벤트/쿠폰/포인트 문의": "쿠폰/포인트가 적용되지 않을 경우 코드, 유효기간, 적용 화면 캡처를 알려주세요. 이벤트 참여/당첨 문의도 함께 확인해드리겠습니다.",
    "배송 문의": "배송 문의는 주문번호와 수령인 정보를 알려주시면 조회해 안내드립니다. 주소 변경은 출고 전까지만 가능하니 가능한 빨리 알려주세요.",
    "수업 내용 문의": "수업 내용/진도 문의군요. 이해가 어려운 부분과 강의명, 주차를 알려주시면 보충 설명이나 예시를 드리겠습니다.",
    "과제/리포트 문의": "과제/리포트 문의는 과제명, 마감 시간, 제출 형식(분량/파일형식) 정보를 남겨주시면 제출 기준을 안내해드리겠습니다.",
    "시험/퀴즈 문의": "시험/퀴즈 문의는 시험명과 일정/범위를 확인해드릴 수 있습니다. 재응시/방식 등 궁금한 점을 구체적으로 알려주세요.",
    "성적/출석 문의": "성적/출석 문의는 과목명, 평가 항목, 확인이 필요한 점(정정/출결) 등을 알려주시면 검토 후 답변드리겠습니다.",
    "수강신청/분반 문의": "수강신청/분반 문의는 과목명, 원하는 분반/시간, 신청 오류 메시지(있다면)를 알려주시면 확인 후 조치 방법을 안내드리겠습니다.",
    "강의자료/녹화본 문의": "강의자료/녹화본이 보이지 않는다면 과목명과 주차를 알려주세요. 업로드 상태나 재생 오류를 확인해 조치 안내드리겠습니다.",
    "조별과제/팀프로젝트 문의": "조별과제/팀프로젝트 문의는 과목명, 팀 편성/역할/발표 관련 어떤 부분이 필요한지 알려주시면 도와드리겠습니다.",
    "진로/학습 상담": "진로/학습 상담은 관심 분야, 목표(진학/취업), 희망 과목을 알려주시면 추천 과목과 상담 일정을 안내드리겠습니다.",
}


def build_suggestion(text: str) -> SuggestionResult:
    normalized = (text or "").strip()
    if not normalized:
        return SuggestionResult(category=None, message=None)

    # LLM 우선: Google → OpenAI 순
    if os.getenv("GOOGLE_API_KEY"):
        llm_res, llm_err = _google_llm(normalized)
        if llm_res and llm_res.message:
            return llm_res
        if llm_err:
            print(f"[LLM] google 실패, rules fallback. reason={llm_err}", flush=True)

    # 규칙 기반
    for category, keywords in RULES:
        if _keyword_match(normalized, keywords):
            return SuggestionResult(category=category, message=TEMPLATES.get(category))

    return SuggestionResult(category="기타", message="내용을 더 알려주시면 빠르게 확인 후 답변드리겠습니다.")
