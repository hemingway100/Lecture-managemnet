// 데모용 하드코딩 데이터

export const demoStudents = [
  { id: 1, name: '김민준', school: '서울중학교', grade: '중1', phone: '010-3001-0001', parentPhone: '010-4001-0001', status: 'active', enrolledAt: '2025-09-01', memo: null, studentCourses: [{ id: 1, courseId: 1, course: { id: 1, name: '중1 기초 영문법' }, tuitionAmount: 280000, status: 'active' }] },
  { id: 2, name: '이서윤', school: '서울중학교', grade: '중1', phone: '010-3001-0002', parentPhone: '010-4001-0002', status: 'active', enrolledAt: '2025-08-15', memo: null, studentCourses: [{ id: 2, courseId: 1, course: { id: 1, name: '중1 기초 영문법' }, tuitionAmount: 280000, status: 'active' }] },
  { id: 3, name: '박지호', school: '한강중학교', grade: '중1', phone: '010-3001-0003', parentPhone: '010-4001-0003', status: 'active', enrolledAt: '2025-10-01', memo: null, studentCourses: [{ id: 3, courseId: 1, course: { id: 1, name: '중1 기초 영문법' }, tuitionAmount: 280000, status: 'active' }] },
  { id: 4, name: '최수아', school: '한강중학교', grade: '중2', phone: '010-3002-0004', parentPhone: '010-4002-0004', status: 'active', enrolledAt: '2025-07-01', memo: null, studentCourses: [{ id: 4, courseId: 2, course: { id: 2, name: '중2 독해 집중반' }, tuitionAmount: 300000, status: 'active' }] },
  { id: 5, name: '정하윤', school: '강남중학교', grade: '중2', phone: '010-3002-0005', parentPhone: '010-4002-0005', status: 'active', enrolledAt: '2025-06-15', memo: null, studentCourses: [{ id: 5, courseId: 2, course: { id: 2, name: '중2 독해 집중반' }, tuitionAmount: 300000, status: 'active' }] },
  { id: 6, name: '강도윤', school: '강남중학교', grade: '중2', phone: '010-3002-0006', parentPhone: '010-4002-0006', status: 'active', enrolledAt: '2025-09-10', memo: null, studentCourses: [{ id: 6, courseId: 2, course: { id: 2, name: '중2 독해 집중반' }, tuitionAmount: 300000, status: 'active' }] },
  { id: 7, name: '윤시우', school: '서초중학교', grade: '중2', phone: '010-3002-0007', parentPhone: '010-4002-0007', status: 'active', enrolledAt: '2025-11-01', memo: null, studentCourses: [{ id: 7, courseId: 2, course: { id: 2, name: '중2 독해 집중반' }, tuitionAmount: 300000, status: 'active' }] },
  { id: 8, name: '장예준', school: '서초중학교', grade: '중3', phone: '010-3003-0008', parentPhone: '010-4003-0008', status: 'active', enrolledAt: '2025-05-01', memo: '영어 기초 보충 필요', studentCourses: [{ id: 8, courseId: 3, course: { id: 3, name: '중3 내신 대비반' }, tuitionAmount: 350000, status: 'active' }] },
  { id: 9, name: '임지안', school: '반포중학교', grade: '중3', phone: '010-3003-0009', parentPhone: '010-4003-0009', status: 'active', enrolledAt: '2025-08-01', memo: null, studentCourses: [{ id: 9, courseId: 3, course: { id: 3, name: '중3 내신 대비반' }, tuitionAmount: 350000, status: 'active' }] },
  { id: 10, name: '한소율', school: '반포중학교', grade: '중3', phone: '010-3003-0010', parentPhone: '010-4003-0010', status: 'active', enrolledAt: '2025-07-15', memo: null, studentCourses: [{ id: 10, courseId: 3, course: { id: 3, name: '중3 내신 대비반' }, tuitionAmount: 350000, status: 'active' }] },
  { id: 11, name: '송이준', school: '역삼중학교', grade: '중3', phone: '010-3003-0011', parentPhone: '010-4003-0011', status: 'active', enrolledAt: '2025-04-01', memo: null, studentCourses: [{ id: 11, courseId: 3, course: { id: 3, name: '중3 내신 대비반' }, tuitionAmount: 350000, status: 'active' }] },
  { id: 12, name: '오지유', school: '역삼중학교', grade: '중3', phone: '010-3003-0012', parentPhone: '010-4003-0012', status: 'active', enrolledAt: '2025-06-01', memo: null, studentCourses: [{ id: 12, courseId: 3, course: { id: 3, name: '중3 내신 대비반' }, tuitionAmount: 350000, status: 'active' }] },
  { id: 13, name: '배현서', school: '창동고등학교', grade: '고1', phone: '010-3004-0013', parentPhone: '010-4004-0013', status: 'active', enrolledAt: '2025-03-01', memo: null, studentCourses: [{ id: 13, courseId: 4, course: { id: 4, name: '고1 통합영어' }, tuitionAmount: 400000, status: 'active' }] },
  { id: 14, name: '류서진', school: '창동고등학교', grade: '고1', phone: '010-3004-0014', parentPhone: '010-4004-0014', status: 'active', enrolledAt: '2025-03-15', memo: null, studentCourses: [{ id: 14, courseId: 4, course: { id: 4, name: '고1 통합영어' }, tuitionAmount: 400000, status: 'active' }] },
  { id: 15, name: '권민서', school: '창동고등학교', grade: '고1', phone: '010-3004-0015', parentPhone: '010-4004-0015', status: 'active', enrolledAt: '2025-05-01', memo: '영어 기초 보충 필요', studentCourses: [{ id: 15, courseId: 4, course: { id: 4, name: '고1 통합영어' }, tuitionAmount: 400000, status: 'active' }] },
  { id: 16, name: '홍지원', school: '창동고등학교', grade: '고1', phone: '010-3004-0016', parentPhone: '010-4004-0016', status: 'active', enrolledAt: '2025-09-01', memo: null, studentCourses: [{ id: 16, courseId: 4, course: { id: 4, name: '고1 통합영어' }, tuitionAmount: 400000, status: 'active' }] },
  { id: 17, name: '문하람', school: '창동고등학교', grade: '고1', phone: '010-3004-0017', parentPhone: '010-4004-0017', status: 'active', enrolledAt: '2025-08-01', memo: null, studentCourses: [{ id: 17, courseId: 4, course: { id: 4, name: '고1 통합영어' }, tuitionAmount: 400000, status: 'active' }] },
  { id: 18, name: '양시현', school: '창동고등학교', grade: '고2', phone: '010-3005-0018', parentPhone: '010-4005-0018', status: 'active', enrolledAt: '2025-03-01', memo: null, studentCourses: [{ id: 18, courseId: 5, course: { id: 5, name: '고2 수능 영어' }, tuitionAmount: 450000, status: 'active' }] },
  { id: 19, name: '조은채', school: '창동고등학교', grade: '고2', phone: '010-3005-0019', parentPhone: '010-4005-0019', status: 'active', enrolledAt: '2025-02-15', memo: null, studentCourses: [{ id: 19, courseId: 5, course: { id: 5, name: '고2 수능 영어' }, tuitionAmount: 450000, status: 'active' }] },
  { id: 20, name: '신유진', school: '창동고등학교', grade: '고2', phone: '010-3005-0020', parentPhone: '010-4005-0020', status: 'active', enrolledAt: '2025-04-01', memo: null, studentCourses: [{ id: 20, courseId: 5, course: { id: 5, name: '고2 수능 영어' }, tuitionAmount: 450000, status: 'active' }] },
  { id: 21, name: '노지훈', school: '창동고등학교', grade: '고2', phone: '010-3005-0021', parentPhone: '010-4005-0021', status: 'active', enrolledAt: '2025-07-01', memo: '수학도 병행 수강 중', studentCourses: [{ id: 21, courseId: 5, course: { id: 5, name: '고2 수능 영어' }, tuitionAmount: 450000, status: 'active' }] },
  { id: 22, name: '하윤서', school: '창동고등학교', grade: '고2', phone: '010-3005-0022', parentPhone: '010-4005-0022', status: 'active', enrolledAt: '2025-06-01', memo: null, studentCourses: [{ id: 22, courseId: 5, course: { id: 5, name: '고2 수능 영어' }, tuitionAmount: 450000, status: 'active' }] },
  { id: 23, name: '전서현', school: '창동고등학교', grade: '고3', phone: '010-3006-0023', parentPhone: '010-4006-0023', status: 'active', enrolledAt: '2025-01-01', memo: null, studentCourses: [{ id: 23, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 24, name: '고민재', school: '창동고등학교', grade: '고3', phone: '010-3006-0024', parentPhone: '010-4006-0024', status: 'active', enrolledAt: '2025-02-01', memo: null, studentCourses: [{ id: 24, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 25, name: '남수빈', school: '창동고등학교', grade: '고3', phone: '010-3006-0025', parentPhone: '010-4006-0025', status: 'active', enrolledAt: '2025-03-01', memo: null, studentCourses: [{ id: 25, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 26, name: '백지아', school: '창동고등학교', grade: '고3', phone: '010-3006-0026', parentPhone: '010-4006-0026', status: 'active', enrolledAt: '2025-04-01', memo: null, studentCourses: [{ id: 26, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 27, name: '서예림', school: '창동고등학교', grade: '고3', phone: '010-3006-0027', parentPhone: '010-4006-0027', status: 'active', enrolledAt: '2025-05-01', memo: null, studentCourses: [{ id: 27, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 28, name: '차우진', school: '창동고등학교', grade: '고3', phone: '010-3006-0028', parentPhone: '010-4006-0028', status: 'active', enrolledAt: '2025-06-01', memo: null, studentCourses: [{ id: 28, courseId: 6, course: { id: 6, name: '고3 수능 실전반' }, tuitionAmount: 500000, status: 'active' }] },
  { id: 29, name: '안태희', school: '서울중학교', grade: '중2', phone: '010-3002-0029', parentPhone: '010-4002-0029', status: 'inactive', enrolledAt: '2025-09-01', memo: null, studentCourses: [] },
  { id: 30, name: '유성민', school: '강남중학교', grade: '중3', phone: '010-3003-0030', parentPhone: '010-4003-0030', status: 'withdrawn', enrolledAt: '2025-05-01', memo: null, studentCourses: [] },
];

export const demoCourses = [
  { id: 1, name: '중1 기초 영문법', schedule: '월수 16:00~17:30', tuition: 280000, status: 'active', teacher: { name: '박서연' }, _count: { studentCourses: 3 } },
  { id: 2, name: '중2 독해 집중반', schedule: '화목 16:00~17:30', tuition: 300000, status: 'active', teacher: { name: '박서연' }, _count: { studentCourses: 4 } },
  { id: 3, name: '중3 내신 대비반', schedule: '월수금 17:00~18:30', tuition: 350000, status: 'active', teacher: { name: '이준호' }, _count: { studentCourses: 5 } },
  { id: 4, name: '고1 통합영어', schedule: '화목 18:00~20:00', tuition: 400000, status: 'active', teacher: { name: '이준호' }, _count: { studentCourses: 5 } },
  { id: 5, name: '고2 수능 영어', schedule: '월수금 19:00~21:00', tuition: 450000, status: 'active', teacher: { name: '최민지' }, _count: { studentCourses: 5 } },
  { id: 6, name: '고3 수능 실전반', schedule: '화목토 18:00~21:00', tuition: 500000, status: 'active', teacher: { name: '최민지' }, _count: { studentCourses: 6 } },
];

export const demoTuitionChart = [
  { month: '2026-01', paid: 8540000, unpaid: 2500000 },
  { month: '2026-02', paid: 9200000, unpaid: 1840000 },
  { month: '2026-03', paid: 6710000, unpaid: 4330000 },
  { month: '2026-04', paid: 0, unpaid: 0 },
  { month: '2026-05', paid: 0, unpaid: 0 },
  { month: '2026-06', paid: 0, unpaid: 0 },
  { month: '2026-07', paid: 0, unpaid: 0 },
  { month: '2026-08', paid: 0, unpaid: 0 },
  { month: '2026-09', paid: 0, unpaid: 0 },
  { month: '2026-10', paid: 0, unpaid: 0 },
  { month: '2026-11', paid: 0, unpaid: 0 },
  { month: '2026-12', paid: 0, unpaid: 0 },
];

export const demoMaterials = [
  { id: 1, title: 'Unit 1 문법 정리 (현재시제)', type: 'file', url: '/uploads/grammar_unit1.pdf', fileName: 'grammar_unit1.pdf', classDate: '2026-03-20', description: '수업 자료입니다', course: { id: 1, name: '중1 기초 영문법' }, _count: { sends: 3 }, createdAt: '2026-03-20' },
  { id: 2, title: 'Ch.1 현재완료 수업 영상', type: 'video', url: 'https://youtu.be/example1', fileName: null, classDate: '2026-03-18', description: '수업 내용 복습용 영상입니다', course: { id: 4, name: '고1 통합영어' }, _count: { sends: 5 }, createdAt: '2026-03-18' },
  { id: 3, title: '필수 어휘 500 리스트', type: 'file', url: '/uploads/vocab500.pdf', fileName: 'vocab_500.pdf', classDate: '2026-03-15', description: '수업 자료입니다', course: { id: 3, name: '중3 내신 대비반' }, _count: { sends: 8 }, createdAt: '2026-03-15' },
  { id: 4, title: 'Ch.2 관계대명사 수업 영상', type: 'video', url: 'https://youtu.be/example2', fileName: null, classDate: '2026-03-14', description: '수업 내용 복습용 영상입니다', course: { id: 5, name: '고2 수능 영어' }, _count: { sends: 4 }, createdAt: '2026-03-14' },
  { id: 5, title: '수능 빈출 숙어 모음', type: 'file', url: '/uploads/idioms.pdf', fileName: 'suneung_idioms.pdf', classDate: '2026-03-12', description: '수업 자료입니다', course: { id: 6, name: '고3 수능 실전반' }, _count: { sends: 12 }, createdAt: '2026-03-12' },
  { id: 6, title: 'Ch.3 가정법 수업 영상', type: 'video', url: 'https://youtu.be/example3', fileName: null, classDate: '2026-03-10', description: '수업 내용 복습용 영상입니다', course: { id: 2, name: '중2 독해 집중반' }, _count: { sends: 2 }, createdAt: '2026-03-10' },
];

export const demoMessages = [
  { id: 1, sentAt: '2026-03-26 14:30', phone: '010-4001-0001', type: 'attendance', content: '[수강생 관리] 김민준 학생이 중1 기초 영문법 수업에 출석하였습니다.', status: 'sent', student: { name: '김민준' } },
  { id: 2, sentAt: '2026-03-26 14:30', phone: '010-4002-0004', type: 'attendance', content: '[수강생 관리] 최수아 학생이 중2 독해 집중반 수업에 지각하였습니다. (사유: 교통체증)', status: 'sent', student: { name: '최수아' } },
  { id: 3, sentAt: '2026-03-25 18:00', phone: '010-4004-0013', type: 'test', content: '[수강생 관리] 배현서 학생 테스트 결과: 85/100 (PASS)', status: 'sent', student: { name: '배현서' } },
  { id: 4, sentAt: '2026-03-25 15:00', phone: '010-4003-0008', type: 'clinic', content: '[수강생 관리] 장예준 학생 내일 14:00 클리닉 일정이 있습니다.', status: 'sent', student: { name: '장예준' } },
  { id: 5, sentAt: '2026-03-24 10:00', phone: '010-3005-0019', type: 'material', content: '[수강생 관리] 조은채님, 수업자료 안내: Ch.2 관계대명사 수업 영상', status: 'sent', student: { name: '조은채' } },
  { id: 6, sentAt: '2026-03-24 09:30', phone: '010-4006-0023', type: 'attendance', content: '[수강생 관리] 전서현 학생이 고3 수능 실전반 수업에 결석하였습니다. (사유: 병결)', status: 'sent', student: { name: '전서현' } },
  { id: 7, sentAt: '2026-03-23 17:00', phone: '010-4005-0021', type: 'test', content: '[수강생 관리] 노지훈 학생 테스트 결과: 62/100 (FAIL)', status: 'failed', student: { name: '노지훈' } },
];
