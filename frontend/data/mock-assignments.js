// data/mock-assignments.js

export const FAKE_ASSIGNMENTS = [
  {
    id: 4,
    title: "과제 4",
    deadline: "11월 2일 23:59",
    status: "active",
    isSubmitted: false, 
    description: "참고자료를 이용해 과제물 제출할 것\n과제 내용 설명...",
    fileName: "과제4.pdf",
    fileUrl: "/과제4.pdf", // (추가!) 문제 파일 경로
  },
  {
    id: 3,
    title: "과제 3",
    deadline: "10월 24일 23:59",
    status: "submitted",
    isSubmitted: true, 
    submittedDate: "2024-10-24",
    submittedFile: "과제3_홍길동.pdf",
    submittedFileUrl: "/sample.pdf", // (추가!) 내가 제출한 파일 경로
    fileName: "과제3.pdf",
    fileUrl: "/sample.pdf",
    description: "과제 3 설명입니다.",
  },
  {
    id: 2,
    title: "과제 2",
    deadline: "10월 8일 23:59",
    status: "submitted",
    isSubmitted: true,
    submittedDate: "2024-10-07",
    submittedFile: "과제2_홍길동.pdf",
    submittedFileUrl: "/sample.pdf",
    fileName: "과제2.pdf",
    fileUrl: "/sample.pdf",
    description: "과제 2 설명입니다.",
  },
  {
    id: 1,
    title: "과제 1",
    deadline: "9월 26일 23:59",
    status: "submitted",
    isSubmitted: true,
    submittedDate: "2024-09-25",
    submittedFile: "과제1_홍길동.pdf",
    submittedFileUrl: "/sample.pdf",
    fileName: "과제1.pdf",
    fileUrl: "/sample.pdf",
    description: "과제 1 설명입니다.",
  },
];