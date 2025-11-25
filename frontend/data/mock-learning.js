// data/mock-learning.js

export const FAKE_LEARNING_PROGRESS = [
  { week: 1, status: 'completed' },
  { week: 2, status: 'completed' },
  { week: 3, status: 'active' },   
  { week: 4, status: 'locked' },   
];

export const FAKE_WEEKS_DATA = [
  {
    id: 1, 
    title: "1주차",
    materials: [
      { 
        id: 'm1', 
        type: 'pdf', 
        title: '샘플이유', 
        url: '/sample.pdf' // (1. 수정!) 1단계에서 public에 넣은 파일 경로
      },
      { 
        id: 'm2', 
        type: 'pdf', 
        title: '자료 2 (링크 없음)',
        url: '#' // (2. 추가!) 링크가 없는 가짜 자료
      },
    ]
  },
  {
    id: 2, 
    title: "2주차",
    materials: [
      { 
        id: 'm3', 
        type: 'pdf', 
        title: '자료 3 (링크 없음)',
        url: '#'
      },
    ]
  },
  { id: 3, title: "3주차", materials: [] },
  { id: 4, title: "4주차", materials: [] },
];