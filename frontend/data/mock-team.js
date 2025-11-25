// data/mock-teams.js

export const FAKE_TEAMS = [
  {
    id: 1,
    name: "1조 - 무한의 계단 정복",
    members: ["김철수", "이영희", "박민수"],
    status: "recruiting", 
    description: "함께 무한의 계단 게임을 만들 팀원을 모집합니다!",
    // (추가!) 채팅 데이터
    chatMessages: [
      { id: 1, sender: "User 1", text: "Message", time: "2:00 pm", isMe: false },
      { id: 2, sender: "User 1", text: "Message", time: "2:00 pm", isMe: false },
      { id: 3, sender: "User 1", text: "Message", time: "2:00 pm", isMe: false },
      { id: 4, sender: "User 2", text: "Message", time: "2:00 pm", isMe: true }, // 내가 보낸 메시지
      { id: 5, sender: "User 1", text: "Message", time: "2:00 pm", isMe: false },
    ],
    // (추가!) 파일 데이터
    files: [
      { id: 1, name: "Doc 7.pdf" },
      { id: 2, name: "Doc 6.pdf" },
      { id: 3, name: "Image.png" },
      { id: 4, name: "Doc 5.pdf" },
    ]
  },
  // ... (다른 팀 데이터도 동일하게 구조 추가) ...
];