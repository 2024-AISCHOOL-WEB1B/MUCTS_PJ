const socket = io();
let sessionNick;

// 세션에서 닉네임을 가져오는 함수
async function getSessionNick() {
  try {
    const response = await fetch('/chat/session');
    const data = await response.json();
    sessionNick = data.nick;
  }
  catch (err) {
    console.error('세션에서 닉네임을 가져오지 못했습니다', err);
  }
}

// 쿼리 스트링으로 된 채팅방 번호 가져오기
const url = new URL(window.location.href); // 현재 페이지의 url을 가져옴
const params = new URLSearchParams(url.search); // 쿼리 스트링 가져오기
const currentRoom = params.get('room') // room 쿼리 스트링 값 가져오기

// 채팅방에 입장하는 함수
async function enterRoom(){
  try {
    // 채팅방에 입장
    socket.emit('enter room', {nick : sessionNick, roomId : currentRoom});
  }
  catch {
    console.error('채팅방에 입장 실패..', err);
  }
}

// 로드 동시에 세션에서 닉네임을 가져옴
window.onload = async () => {
  await getSessionNick();
  await enterRoom();
}

// 채팅 요소 선택
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages'); // 채팅이 올라올 곳

// 본인 입장 알림
socket.on('you joined room', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// 새로운 유저 입장 알림
socket.on('new user', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// 클라이언트가 입력한 메시지 송신
form.addEventListener('submit', (event) => {
  event.preventDefault(); // 제출 이벤트를 취소 시킴
  if (input.value) {
    socket.emit('send message', `${sessionNick} : ${input.value}`);
    input.value = '';
  }
});

// 메시지 수신
socket.on('return message', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});