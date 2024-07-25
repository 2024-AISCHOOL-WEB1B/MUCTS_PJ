const socket = io();
let sessionNick;

// 세션에서 닉네임을 가져오는 함수
async function getSessionNick() {
  try {
      const response = await fetch('/chat/session');
      const data = await response.json();
      sessionNick = data.nick;
  } catch (err) {
      console.error('세션에서 닉네임을 가져오지 못했습니다', err);
  }
}

// 쿼리 스트링으로 된 채팅방 번호 가져오기
const url = new URL(window.location.href); // 현재 페이지의 url을 가져옴
const params = new URLSearchParams(url.search); // 쿼리 스트링 가져오기
const currentRoom = params.get('room'); // room 쿼리 스트링 값 가져오기

// 채팅방에 입장하는 함수
async function enterRoom() {
  try {
      // 채팅방에 입장
      socket.emit('enter room', { nick: sessionNick, roomId: currentRoom });
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

// 본인 입장 알림
socket.on('you joined room', (msg) => {
  serverMessage(msg);
  scrollToBottom();
});

// 새로운 유저 입장 알림
socket.on('new user', (msg) => {
  serverMessage(msg);
  scrollToBottom();
});

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

  // 새로운 li 요소 생성
  const li = document.createElement('li');
  li.className = 'conversation-item';

  // 메세지의 발신자가 나인지 아닌지에 따라 클래스 추가
  if (sender === 'me') {
      li.classList.add('me');
  }

  // 메시지 콘텐츠를 담을 div 생성
  const contentDiv = document.createElement('div');
  contentDiv.className = 'conversation-item-content';

  // 메시지 박스를 담을 div 생성
  const boxDiv = document.createElement('div');
  boxDiv.className = 'conversation-item-box';

  // 메시지 텍스트를 담을 div 생성
  const textDiv = document.createElement('div');
  textDiv.className = 'conversation-item-text';

  // 메시지 텍스트와 시간 추가
  const p = document.createElement('p');
  p.textContent = text;
  const timeDiv = document.createElement('div');
  timeDiv.className = 'conversation-item-time';
  timeDiv.textContent = time;

  // 텍스트와 시간을 텍스트 div에 추가
  textDiv.appendChild(p);
  textDiv.appendChild(timeDiv);

  // 메시지 박스에 텍스트 div 추가
  boxDiv.appendChild(textDiv);

  // 메시지 콘텐츠 div에 메시지 박스 추가
  contentDiv.appendChild(boxDiv);

  // li 요소에 메시지 콘텐츠 div 추가
  li.appendChild(contentDiv);

  // #conversation-wrapper 요소에 li 추가
  conversationWrapper.appendChild(li);
}

// 서버 메시지를 보여주는 함수
function serverMessage(text) {
  // 새로운 div 요소 생성
  const div = document.createElement('div');
  div.className = 'conversation-divider';

  // 메시지 텍스트 추가
  const span = document.createElement('span');
  span.textContent = text;

  // divider에 서버 메시지 span 추가
  div.appendChild(span);

  // #conversation-wrapper 요소에 divider 추가
  conversationWrapper.appendChild(div);
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


// 여기부터 나중에 할거임 프론트엔드 버튼 처리할 곳

/*
// start: Sidebar
document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function(e) {
  e.preventDefault();
  this.parentElement.classList.toggle('active');
});

document.addEventListener('click', function(e) {
  if (!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
      document.querySelector('.chat-sidebar-profile').classList.remove('active');
  }
});
// end: Sidebar

// start: Conversation

/*
document.querySelectorAll('.conversation-form-input').forEach(function(item) {
  item.addEventListener('input', function() {
      this.rows = this.value.split('\n').length;
  });
});
*/
/*
document.querySelectorAll('[data-conversation]').forEach(function(item) {
  item.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.conversation').forEach(function(i) {
          i.classList.remove('active');
      });
      document.querySelector(this.dataset.conversation).classList.add('active');
  });
});

document.querySelectorAll('.conversation-back').forEach(function(item) {
  item.addEventListener('click', function(e) {
      e.preventDefault();
      this.closest('.conversation').classList.remove('active');
      document.querySelector('.conversation-default').classList.add('active');
  });
});
// end: Conversation
*/