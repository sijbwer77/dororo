/* data/mock-messages.js */

export const FAKE_MESSAGES = [
  {
    id: 1,
    sender: "메시지 1",
    date: "2025년 9월 26일",
    content: "세부내용 첫 줄...",
    // ✅ (수정) 대화 내용 추가
    conversations: [
      {
        id: 101,
        role: "강사",
        date: "2025년 9월 27일",
        text: "ㅗㅗㅗㅗㅗㅗㅗㅗㅗㅗ",
        profileImage: "/profile-circle.svg"
      },
      {
        id: 102,
        role: "학생 이름",
        date: "2025년 9월 26일",
        text: "안할래요ㅠㅠㅠㅠㅠㅠ",
        profileImage: "/profile-circle.svg" 
      }
    ]
  },
  {
    id: 2,
    sender: "메시지 2",
    date: "2025년 9월 30일",
    content: "세부내용 첫 줄...",
    conversations: [
      {
        id: 201,
        role: "강사",
        date: "2025년 10월 1일",
        text: "문의하신 내용에 대한 답변입니다. 해당 부분은 강의 계획서 3페이지를 참고하시면 자세히 나와있습니다.",
        profileImage: "/profile-circle.svg"
      },
      {
        id: 202,
        role: "학생 이름",
        date: "2025년 9월 30일",
        text: "교수님, 다음 주 과제 제출 방식이 궁금합니다. 이메일로 제출하면 되나요?",
        profileImage: "/profile-circle.svg" 
      }
    ]
  },
  {
    id: 3,
    sender: "메시지 3",
    date: "2025년 10월 15일",
    content: "세부내용 첫 줄...",
    conversations: [
      {
        id: 301,
        role: "강사",
        date: "2025년 10월 16일",
        text: "네, 알겠습니다. 화요일 오후 2시에 연구실로 오시면 됩니다.",
        profileImage: "/profile-circle.svg"
      },
      {
        id: 302,
        role: "학생 이름",
        date: "2025년 10월 15일",
        text: "다음 주 회의 일정 조율을 위해 팀원들과 상의해본 결과 화요일 오후가 좋을 것 같습니다. 시간 괜찮으신가요?",
        profileImage: "/profile-circle.svg" 
      }
    ]
  },
  {
    id: 4,
    sender: "메시지 4",
    date: "2025년 10월 26일",
    content: "세부내용 첫 줄...",
    conversations: [
      {
        id: 401,
        role: "강사",
        date: "2025년 10월 27일",
        text: "네, 맞습니다. 5장 전체 내용이 포함됩니다. 열심히 공부하세요!",
        profileImage: "/profile-circle.svg"
      },
      {
        id: 402,
        role: "학생 이름",
        date: "2025년 10월 26일",
        text: "중간고사 시험 범위 관련해서 질문이 있습니다. 교재 5장까지 포함인가요?",
        profileImage: "/profile-circle.svg" 
      }
    ]
  }
];