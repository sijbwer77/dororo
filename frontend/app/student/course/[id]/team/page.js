'use client'; 

import { useState, useRef, useEffect } from 'react';
import styles from "./team.module.css"; 
import Image from "next/image";
import Link from "next/link";
import { useParams} from 'next/navigation'; 
import { FAKE_TEAMS } from "@/data/mock-team.js";
import { useTeamData } from "./teamContext"; 
import Sidebar from "@/components/Sidebar"; 

export default function TeamPage() {
  const params = useParams(); 
  const courseId = params.id;
  const { files, chatMessages, addFile, addChatMessage } = useTeamData();

  // --- 오른쪽 패널 (채팅/업로드) ---
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState(""); 
  const fileInputRef = useRef(null);

  // --- 왼쪽 패널 (폴더/페이지) ---
  const inputRef = useRef(null);

  const [folders, setFolders] = useState([
    { 
      id: 1, name: "회의록", isOpen: true, 
      items: [{ id: 101, title: "1일차 아이디어 회의" }, { id: 102, title: "2일차 역할 분담" }] 
    },
    { 
      id: 2, name: "자료조사", isOpen: false, 
      items: [{ id: 201, title: "유사 서비스 분석" }] 
    }
  ]);

  const [addingState, setAddingState] = useState({ type: null, targetId: null });
  const [inputValue, setInputValue] = useState("");

  // 드래그 정보 저장
  const dragItem = useRef({ folderIdx: null, itemIdx: null, type: null });
  const dragOverItem = useRef({ folderIdx: null, itemIdx: null, type: null });

  // ✅ [추가] 드래그 중 시각적 효과를 위한 State (현재 호버 중인 ID)
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    if (addingState.type && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingState]);

  // --- 드래그 핸들러 ---

  const handleDragStart = (e, folderIdx, itemIdx, type) => {
    e.stopPropagation(); 
    dragItem.current = { folderIdx, itemIdx, type };
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragEnter = (e, folderIdx, itemIdx, type, uniqueId) => {
    e.stopPropagation();
    dragOverItem.current = { folderIdx, itemIdx, type };
    
    // ✅ [추가] 현재 마우스가 올라간 요소의 ID 저장 (스타일용)
    setDragOverId(uniqueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
  };

  const handleSort = () => {
    // ✅ [추가] 드래그 끝나면 하이라이트 해제
    setDragOverId(null);

    const source = dragItem.current;
    const dest = dragOverItem.current;

    // 유효성 검사
    if (source.folderIdx === null || dest.folderIdx === null) return;
    
    // 1. 폴더끼리 순서 변경
    if (source.type === 'folder' && dest.type === 'folder') {
      if (source.folderIdx === dest.folderIdx) return;
      
      let _folders = [...folders];
      const draggedFolder = _folders[source.folderIdx];
      _folders.splice(source.folderIdx, 1);
      _folders.splice(dest.folderIdx, 0, draggedFolder);
      setFolders(_folders);
    } 
    
    // 2. 페이지(파일) 이동 로직
    else if (source.type === 'page') {
      let _folders = [...folders];
      
      // (1) 원래 폴더에서 해당 파일 꺼내기
      const sourceItems = _folders[source.folderIdx].items;
      const draggedItem = sourceItems[source.itemIdx];
      sourceItems.splice(source.itemIdx, 1);

      // (2-A) 다른 '페이지' 위에 떨어뜨림 -> 그 페이지 위치로 이동
      if (dest.type === 'page') {
        const destItems = _folders[dest.folderIdx].items;
        destItems.splice(dest.itemIdx, 0, draggedItem);
        
        if (!_folders[dest.folderIdx].isOpen) {
          _folders[dest.folderIdx].isOpen = true;
        }
      } 
      // (2-B) '폴더 헤더(제목)' 위에 떨어뜨림 -> 그 폴더의 맨 마지막으로 이동
      else if (dest.type === 'folder') {
        const destItems = _folders[dest.folderIdx].items;
        destItems.push(draggedItem); 
        _folders[dest.folderIdx].isOpen = true;
      }

      setFolders(_folders);
    }

    // 초기화
    dragItem.current = { folderIdx: null, itemIdx: null, type: null };
    dragOverItem.current = { folderIdx: null, itemIdx: null, type: null };
  };


  // --- 기존 핸들러들 ---
  const toggleFolder = (folderId) => {
    setFolders(folders.map(f => f.id === folderId ? { ...f, isOpen: !f.isOpen } : f));
  };

  const startAdding = (type, targetId = null) => {
    if (type === 'page' && targetId) {
       setFolders(folders.map(f => f.id === targetId ? { ...f, isOpen: true } : f));
    }
    setAddingState({ type, targetId });
    setInputValue("");
  };

  const cancelAdding = () => {
    setAddingState({ type: null, targetId: null });
    setInputValue("");
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      if (!inputValue.trim()) { cancelAdding(); return; }
      if (addingState.type === 'folder') {
        setFolders([...folders, { id: Date.now(), name: inputValue, isOpen: true, items: [] }]);
      } else if (addingState.type === 'page') {
        const newPage = { id: Date.now(), title: inputValue };
        setFolders(folders.map(f => f.id === addingState.targetId ? { ...f, items: [...f.items, newPage] } : f));
      }
      cancelAdding();
    } else if (e.key === 'Escape') { cancelAdding(); }
  };

  const handleUploadClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      addFile({ id: Date.now(), name: selectedFile.name, url: objectUrl });
    }
    e.target.value = ''; 
  };
  const handleChatSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!chatInput.trim()) return;
      addChatMessage(chatInput);
      setChatInput("");
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <section className={styles.teamListSection}>
          <div className={styles.teamListHeader}>
            <h1 className={styles.mainTitle}>팀1</h1>
          </div>
          
          <div className={styles.notionTreeBox} onDragOver={handleDragOver}>
             
             {folders.map((folder, fIndex) => (
               <div 
                  key={folder.id} 
                  className={styles.folderGroup}
                  // 폴더 드래그
                  draggable
                  onDragStart={(e) => handleDragStart(e, fIndex, null, 'folder')}
                  onDragEnter={(e) => handleDragEnter(e, fIndex, null, 'folder', folder.id)}
                  onDragEnd={handleSort}
                  onDragOver={handleDragOver}
               >
                 
                 {/* ✅ 폴더 헤더 Row (드래그 시 하이라이트 적용) */}
                 <div 
                    className={`${styles.infoRow} ${dragOverId === folder.id ? styles.dragOverItem : ''}`} 
                    onClick={() => toggleFolder(folder.id)}
                 >
                   <span className={styles.arrowIconWrapper}>
                     {folder.isOpen ? (
                       <Image src="/down.svg" alt="Open" width={20} height={20} />
                     ) : (
                       <Image src="/arrow-right.svg" alt="Closed" width={20} height={20} />
                     )}
                   </span>
                   <span className={styles.folderIconWrapper}>
                     <Image src="/team-note.svg" alt="Folder" width={25} height={20} />
                   </span>
                   <span className={styles.rowText}>{folder.name}</span>
                   <button 
                     className={styles.hoverAddButton} 
                     onClick={(e) => { e.stopPropagation(); startAdding('page', folder.id); }}
                     title="페이지 추가"
                   >
                     +
                   </button>
                 </div>

                 {folder.isOpen && (
                   <div className={styles.subListContainer}>
                     
                     {folder.items.map((item, iIndex) => (
                       <Link 
                         key={item.id} 
                         href={`/student/course/${courseId}/team/meeting/${item.id}?title=${encodeURIComponent(item.title)}`}
                         // ✅ 파일(페이지) Row (드래그 시 하이라이트 적용)
                         className={`${styles.subInfoRowLink} ${dragOverId === item.id ? styles.dragOverItem : ''}`}
                         // 페이지 드래그
                         draggable 
                         onDragStart={(e) => handleDragStart(e, fIndex, iIndex, 'page')}
                         onDragEnter={(e) => handleDragEnter(e, fIndex, iIndex, 'page', item.id)}
                         onDragEnd={handleSort}
                         onDragOver={handleDragOver}
                         onClick={(e) => { if(dragItem.current.type) e.preventDefault(); }}
                       >
                         <Image src="/team-note.svg" alt="Page" width={20} height={16} style={{ opacity: 0.5, marginRight: '10px' }} />
                         <span>{item.title}</span>
                       </Link>
                     ))}

                     {/* 인라인 입력창 */}
                     {addingState.type === 'page' && addingState.targetId === folder.id && (
                       <div className={styles.subInfoRowLink} style={{ cursor: 'text' }}>
                         <Image src="/team-note.svg" alt="Page" width={20} height={16} style={{ opacity: 0.5, marginRight: '10px' }} />
                         <input
                           ref={inputRef} type="text" className={styles.inlineInput} placeholder="페이지 이름..."
                           value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                           onKeyDown={handleInputSubmit} onBlur={cancelAdding}
                         />
                       </div>
                     )}
                   </div>
                 )}
               </div>
             ))}

             {addingState.type === 'folder' && (
                <div className={styles.infoRow} style={{ cursor: 'text' }}>
                   <span className={styles.arrowIconWrapper}><Image src="/down.svg" alt="Open" width={20} height={20} /></span>
                   <span className={styles.folderIconWrapper}><Image src="/team-note.svg" alt="Folder" width={25} height={20} /></span>
                   <input
                     ref={inputRef} type="text" className={styles.inlineInput} placeholder="폴더 이름..."
                     value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={handleInputSubmit} onBlur={cancelAdding}
                   />
                </div>
             )}

             <div className={styles.rootAddArea}>
                <button className={styles.rootAddButton} onClick={() => startAdding('folder')}>
                  + 폴더 추가
                </button>
             </div>

          </div>
        </section>

        {/* 오른쪽 섹션 유지 */}
        <section className={styles.teamWorkSection}>
          <div className={styles.tabButtons}>
            <button className={`${styles.tabButton} ${activeTab === 'chat' ? styles.activeTab : ''}`} onClick={() => setActiveTab('chat')}><Image src="/chat.svg" alt="Chat" width={28} height={28} /></button>
            <button className={`${styles.tabButton} ${activeTab === 'upload' ? styles.activeTab : ''}`} onClick={() => setActiveTab('upload')}><Image src="/upload-icon.svg" alt="Upload" width={28} height={28} /></button>
          </div>
          <div className={styles.workContent}>
            {activeTab === 'chat' && (
              <div className={styles.chatContainer}>
                <div className={styles.messagesArea}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageRow} ${msg.isMe ? styles.myMessage : styles.otherMessage}`}>
                      {!msg.isMe && <div className={styles.msgSender}>{msg.sender}</div>}
                      <div className={styles.msgBubble}>{msg.text}</div>
                      <span className={styles.msgTime}>{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.chatInputBox}>
                   <input type="text" placeholder="Message" className={styles.chatInput} value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={handleChatSubmit} />
                </div>
              </div>
            )}
            {activeTab === 'upload' && (
              <div className={styles.uploadContainer}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <div className={styles.fileUploadBox} onClick={handleUploadClick} style={{ cursor: 'pointer' }}>
                   <Image src="/upload.svg" alt="Upload" width={60} height={60} />
                   <p className={styles.uploadText}>파일을 업로드하세요</p>
                </div>
                <div className={styles.fileList}>
                  {files.map((file) => (
                    <a key={file.id} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className={styles.fileItem} style={{display:'block', textDecoration:'none', color:'black'}}>
                       {file.name}
                    </a>
                  ))}
                </div>
                <div className={styles.pagination}>&lt; 1 2 3 &gt;</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}