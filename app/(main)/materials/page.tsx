'use client';
import { useState, useEffect, useCallback } from 'react';

interface Course { id: number; name: string }
interface Student { id: number; name: string; phone: string | null; grade: string | null }
interface MaterialItem {
  id: number; title: string; type: string; url: string;
  classDate: string | null; description: string | null; fileName: string | null;
  createdAt: string;
  course: { id: number; name: string } | null;
  _count: { sends: number };
}

type TabType = 'all' | 'file' | 'video';

export default function MaterialsPage() {
  const [tab, setTab] = useState<TabType>('all');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSend, setShowSend] = useState<MaterialItem | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  // 업로드 폼
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourse, setUploadCourse] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');

  // 영상 폼
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCourse, setVideoCourse] = useState('');
  const [videoDate, setVideoDate] = useState('');
  const [videoDesc, setVideoDesc] = useState('');

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(setCourses);
    fetch('/api/students?status=active').then(r => r.json()).then(setStudents);
  }, []);

  const loadMaterials = useCallback(() => {
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('type', tab);
    if (search) params.set('search', search);
    fetch(`/api/materials?${params}`).then(r => r.json()).then(setMaterials);
  }, [tab, search]);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  async function handleUpload() {
    if (!uploadFile || !uploadTitle.trim()) { alert('제목과 파일을 선택해주세요.'); return; }
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('title', uploadTitle.trim());
    fd.append('courseId', uploadCourse);
    fd.append('classDate', uploadDate);
    fd.append('description', uploadDesc);
    await fetch('/api/materials', { method: 'POST', body: fd });
    setShowUpload(false);
    setUploadFile(null); setUploadTitle(''); setUploadCourse(''); setUploadDate(''); setUploadDesc('');
    loadMaterials();
  }

  async function handleVideoCreate() {
    if (!videoTitle.trim() || !videoUrl.trim()) { alert('제목과 URL을 입력해주세요.'); return; }
    await fetch('/api/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create', type: 'video', title: videoTitle.trim(),
        url: videoUrl.trim(), courseId: parseInt(videoCourse) || null,
        classDate: videoDate, description: videoDesc,
      }),
    });
    setShowVideo(false);
    setVideoTitle(''); setVideoUrl(''); setVideoCourse(''); setVideoDate(''); setVideoDesc('');
    loadMaterials();
  }

  async function handleDelete(id: number) {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch('/api/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    loadMaterials();
  }

  function openSendModal(m: MaterialItem) {
    setShowSend(m);
    setSelectedStudents([]);
  }

  function toggleStudent(id: number) {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  function selectAll() {
    if (selectedStudents.length === students.length) setSelectedStudents([]);
    else setSelectedStudents(students.map(s => s.id));
  }

  async function handleSend() {
    if (selectedStudents.length === 0 || !showSend) return;
    setSending(true);
    const res = await fetch('/api/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', materialId: showSend.id, studentIds: selectedStudents }),
    });
    const data = await res.json();
    setSending(false);
    alert(`${data.sentCount}명에게 발송되었습니다.`);
    setShowSend(null);
    loadMaterials();
  }

  const formatDate = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : '';

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>자료 / 영상</h5>
          <p className="text-muted small mb-0">수업 자료와 영상 링크를 관리하고 학생에게 발송합니다</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => setShowUpload(true)}>
            <i className="bi bi-cloud-arrow-up me-1"></i>파일 업로드
          </button>
          <button className="btn btn-primary" onClick={() => setShowVideo(true)}>
            <i className="bi bi-youtube me-1"></i>영상 링크 등록
          </button>
        </div>
      </div>

      {/* 탭 + 검색 */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-1">
              {([['all', '전체'], ['file', '파일자료'], ['video', '수업영상']] as [TabType, string][]).map(([key, label]) => (
                <button key={key} className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setTab(key)}>{label}</button>
              ))}
            </div>
            <div className="d-flex gap-2">
              <input type="text" className="form-control form-control-sm" style={{ width: 200 }}
                placeholder="제목 검색..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* 자료 목록 */}
      {materials.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-folder2-open text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
            <p className="text-muted mt-2">등록된 자료가 없습니다</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>유형</th>
                    <th>제목</th>
                    <th>링크</th>
                    <th className="text-center">강의</th>
                    <th className="text-center">수업일</th>
                    <th className="text-center">발송</th>
                    <th className="text-center">등록일</th>
                    <th className="text-center" style={{ width: 60 }}>열기</th>
                    <th className="text-center" style={{ width: 60 }}>발송</th>
                    <th className="text-center" style={{ width: 45 }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => {
                    // 링크 표시용 truncate
                    const displayUrl = (() => {
                      try {
                        const u = new URL(m.url);
                        const short = u.hostname.replace('www.', '') + u.pathname;
                        return short.length > 35 ? short.slice(0, 35) + '...' : short;
                      } catch {
                        return m.url.length > 40 ? m.url.slice(0, 40) + '...' : m.url;
                      }
                    })();

                    return (
                    <tr key={m.id}>
                      <td>
                        {m.type === 'file' ? (
                          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem' }}>
                            <i className="bi bi-file-earmark-text me-1"></i>파일
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#dbeafe', color: '#2563eb', fontSize: '0.7rem' }}>
                            <i className="bi bi-play-circle me-1"></i>영상
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{m.title}</div>
                        {m.description && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.description}</div>}
                        {m.fileName && <div className="text-muted" style={{ fontSize: '0.72rem' }}><i className="bi bi-paperclip me-1"></i>{m.fileName}</div>}
                      </td>
                      <td>
                        <a href={m.url} target="_blank" rel="noreferrer" className="text-decoration-none"
                          style={{ fontSize: '0.78rem', color: 'var(--brand)', wordBreak: 'break-all' }}
                          title={m.url}>
                          <i className="bi bi-link-45deg me-1"></i>{displayUrl}
                        </a>
                      </td>
                      <td className="text-center">
                        {m.course ? <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>{m.course.name}</span> : <span className="text-muted">-</span>}
                      </td>
                      <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(m.classDate) || '-'}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>{m._count.sends}회</span>
                      </td>
                      <td className="text-center text-muted" style={{ fontSize: '0.78rem' }}>
                        {new Date(m.createdAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="text-center">
                        <a href={m.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary py-0 px-2"
                          style={{ fontSize: '0.75rem' }}>
                          {m.type === 'file' ? <><i className="bi bi-download"></i></> : <><i className="bi bi-box-arrow-up-right"></i></>}
                        </a>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-success py-0 px-2" style={{ fontSize: '0.75rem' }}
                          onClick={() => openSendModal(m)}>
                          <i className="bi bi-send"></i>
                        </button>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ fontSize: '0.75rem' }}
                          onClick={() => handleDelete(m.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 파일 업로드 모달 */}
      {showUpload && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-cloud-arrow-up me-2"></i>파일 업로드</h6>
                <button className="btn-close" onClick={() => setShowUpload(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">자료 제목</label>
                  <input type="text" className="form-control" placeholder="예: Unit 3 문법 정리" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} autoFocus />
                </div>
                <div className="mb-3">
                  <label className="form-label">파일 선택</label>
                  <input type="file" className="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp,.jpg,.png"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  <div className="form-text">PDF, HWP, Word, PPT, Excel, 이미지 파일</div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">강의</label>
                    <select className="form-select" value={uploadCourse} onChange={e => setUploadCourse(e.target.value)}>
                      <option value="">공통</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">수업 날짜</label>
                    <input type="date" className="form-control" value={uploadDate} onChange={e => setUploadDate(e.target.value)} />
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">설명</label>
                  <textarea className="form-control" rows={2} placeholder="자료 설명" value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowUpload(false)}>취소</button>
                <button className="btn btn-primary" onClick={handleUpload}><i className="bi bi-cloud-arrow-up me-1"></i>업로드</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 영상 링크 등록 모달 */}
      {showVideo && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-youtube me-2" style={{ color: '#dc2626' }}></i>수업 영상 등록</h6>
                <button className="btn-close" onClick={() => setShowVideo(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">강의 제목 (수업 범위)</label>
                  <input type="text" className="form-control" placeholder="예: Ch.3 현재완료 - 경험/완료 용법" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} autoFocus />
                </div>
                <div className="mb-3">
                  <label className="form-label">YouTube 링크</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                    <input type="url" className="form-control" placeholder="https://youtu.be/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">강의</label>
                    <select className="form-select" value={videoCourse} onChange={e => setVideoCourse(e.target.value)}>
                      <option value="">공통</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">수업 날짜</label>
                    <input type="date" className="form-control" value={videoDate} onChange={e => setVideoDate(e.target.value)} />
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">설명</label>
                  <textarea className="form-control" rows={2} placeholder="수업 내용 요약" value={videoDesc} onChange={e => setVideoDesc(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowVideo(false)}>취소</button>
                <button className="btn btn-primary" onClick={handleVideoCreate}>등록</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 학생 발송 모달 */}
      {showSend && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-send me-2"></i>자료 발송</h6>
                <button className="btn-close" onClick={() => setShowSend(null)}></button>
              </div>
              <div className="modal-body">
                {/* 발송할 자료 미리보기 */}
                <div className="p-3 rounded mb-3" style={{ background: 'var(--bg-body)', fontSize: '0.85rem' }}>
                  <div className="fw-semibold">{showSend.title}</div>
                  <div className="text-muted small text-truncate">{showSend.url}</div>
                </div>

                {/* 메시지 템플릿 미리보기 */}
                <div className="mb-3">
                  <label className="form-label">발송 메시지 미리보기</label>
                  <div className="border rounded p-3" style={{ background: '#fffbeb', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    <div>[수강생 관리] <strong>{'{{학생명}}'}</strong>님, 수업자료 안내드립니다.</div>
                    <div className="mt-1"><strong>{showSend.title}</strong></div>
                    <div className="text-primary mt-1">{showSend.url}</div>
                  </div>
                </div>

                {/* 학생 선택 */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">발송 대상 <span className="text-muted">({selectedStudents.length}명 선택)</span></label>
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" style={{ fontSize: '0.72rem' }} onClick={selectAll}>
                    {selectedStudents.length === students.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
                <div className="border rounded" style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {students.map(s => (
                    <label key={s.id}
                      className="d-flex align-items-center gap-2 px-3 py-2 cursor-pointer"
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        background: selectedStudents.includes(s.id) ? 'var(--brand-bg)' : undefined,
                        transition: 'all 0.1s',
                      }}>
                      <input type="checkbox" className="form-check-input m-0"
                        checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                      <div className="flex-grow-1">
                        <span style={{ fontSize: '0.84rem' }}>{s.name}</span>
                        {s.grade && <span className="text-muted ms-1" style={{ fontSize: '0.72rem' }}>({s.grade})</span>}
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{s.phone || '번호없음'}</span>
                      {!s.phone && <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '0.7rem' }}></i>}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowSend(null)}>취소</button>
                <button className="btn btn-primary" onClick={handleSend} disabled={sending || selectedStudents.length === 0}>
                  <i className="bi bi-send me-1"></i>{sending ? '발송 중...' : `${selectedStudents.length}명에게 발송`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
