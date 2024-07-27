const socket = io();
let sessionNick;
let sessionUserId;

// 세션에서 닉네임과 아이디를을 가져오는 함수
async function getSessionNick() {
  try {
      const response = await fetch('/chat/session');
      const data = await response.json();
      sessionNick = data.nick;
      sessionUserId = data.userId;
  } catch (err) {
      console.error('세션에서 닉네임을 가져오지 못했습니다', err);
  }
}

// 쿼리 스트링으로 된 채팅방 번호 가져오기
const url = new URL(window.location.href); // 현재 페이지의 url을 가져옴
const params = new URLSearchParams(url.search); // 쿼리 스트링 가져오기
const currentRoom = parseInt(params.get('room')); // room 쿼리 스트링 값 가져오기, party_id는 number임

// 채팅방에 입장하는 함수
async function enterRoom() {
  try {
      // 채팅방에 입장
      socket.emit('enter room', { nick: sessionNick, userId : sessionUserId, roomId: currentRoom });
  } catch (err) {
      console.error('채팅방에 입장 실패..', err);
  }
}

// 로드 동시에 세션에서 닉네임을 가져옴
window.onload = async () => {
  await getSessionNick();
  await enterRoom();
}

// 채팅 요소 선택
const textarea = document.getElementById('messageInput');
const conversationWrapper = document.getElementById('conversation-wrapper');
const participantList = document.getElementById('content-participants-list'); // 참가자들이 담길 리스트 선택
const roomTitle = document.getElementById("conversation-status-title") // 채팅방 타이틀
const roomCapacity = document.getElementById("conversation-status-capacity") // 채팅방 인원수

// 본인 입장 알림
socket.on('you joined room', (data) => {
  roomTitle.innerText = data.roomTitle; 
  serverMessage(data.msg);
  scrollToBottom();
});

// 새로운 유저 입장 알림
socket.on('new user', (msg) => {
  serverMessage(msg);
  scrollToBottom();
});


// 사용자에게 인원 현황을 보여주자..
socket.on('reload participants', (data) => {
  participantList.innerHTML = '<li class="content-participants-title"><span>Participants</span></li>'; // 기존 리스트 비우기
  const { participantsID, participantsNick, user_id, personnel} = data;
  let isReady = true; // 기본값으로 true 고정 (나중에 변경 가능)

  if(personnel > participantsID.length){
    roomCapacity.innerText = `${participantsID.length} / ${personnel}`;
  }
  else{
    roomCapacity.innerText = `${participantsID.length} / ${personnel}`;
    roomCapacity.classList.add('full');
  }

  for (let i = 0; i < participantsID.length; i++) {
      const id = participantsID[i];
      const nickname = participantsNick[i];
      const isHost = id === user_id; // 방장 여부 체크
      addParticipant(nickname, id, isHost, isReady);
  }
});

function addParticipant(nickname, id, isHost, isReady) {
  // 참가자 정보를 담는 HTML 구조
  const participantHTML = `
      <li>
          <div class="content-participant">
              <span class="content-participant-info">
                  <span class="content-participant-name">${nickname}</span>
                  <span class="content-participant-text">${id}</span>
              </span>
              <span class="content-participant-more">
                  ${isReady ? '<span class="content-participant-ready">완료</span>' : ''}
                  <span class="content-participant-role">${isHost ? 'Host' : 'Guest'}</span>
              </span>
          </div>
      </li>
  `;

  // 새로운 참가자를 리스트에 추가
  participantList.innerHTML += participantHTML;
}




// Enter 키를 감지하여 메시지 전송
textarea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 기본 Enter 동작 방지 (줄 바꿈 방지)
      if (textarea.value.trim()) { // 공백 제거 후 메시지가 비어 있지 않은 경우에만
          socket.emit('send message', { sender: sessionNick, msg: textarea.value.trim() });
          textarea.value = ''; // 메시지 전송 후 텍스트 영역 비우기
      }
  }
});

// 내 메시지 수신
socket.on('return myMessage', (data) => {
  let sender = 'me';
  addMessage(sender, data.msg);
  scrollToBottom();
});

// 다른 사람 메시지 수신
socket.on('return message', (data) => {
  let sender = data.sender||"Guest";
  let msg = `${sender} : ${data.msg}`;
  addMessage(sender, msg);
  scrollToBottom();
});





// 메시지를 추가하는 함수
function addMessage(sender, text) {
  // 현재 시간을 클라이언트 기준으로 가져오기
  const now = new Date();
  const time = formatTime(now);

  // 메시지 콘텐츠 HTML 구조
  const messageHTML = `
      <li class="conversation-item ${sender === 'me' ? 'me' : ''}">
          <div class="conversation-item-content">
              <div class="conversation-item-box">
                  <div class="conversation-item-text">
                      <p>${text}</p>
                      <div class="conversation-item-time">${time}</div>
                  </div>
              </div>
          </div>
      </li>
  `;

  // #conversation-wrapper 요소에 li 추가
  conversationWrapper.innerHTML += messageHTML;
}

// 서버 메시지를 보여주는 함수
function serverMessage(text) {
  // 새로운 div 요소 생성
  const serverMessage = `
  <div class="conversation-divider">
    <span>${text}</span>
  </div>
  `
  // #conversation-wrapper 요소에 divider 추가
  conversationWrapper.innerHTML += serverMessage;
}

// 채팅창의 가장 아래로 스크롤하는 함수
function scrollToBottom() {
  // 마지막 자식 요소를 선택하여 스크롤
  const lastMessage = conversationWrapper.lastElementChild;
  if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth' });
  }
}

// 현재 시간을 포맷팅하는 함수 (예: "12:30")
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}