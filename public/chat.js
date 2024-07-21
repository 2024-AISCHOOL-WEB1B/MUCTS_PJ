document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const room = urlParams.get('room');
  let roomId = room;

  const socket = io();

  // 페이지가 로드되면 방에 참여
  socket.emit('join room', roomId);

  // 채팅 요소 선택
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages'); // 채팅이 올라올 곳

  // 클라이언트가 입력한 채팅을
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  // 클라이언트에게 채팅방 입장 메시지 전송
  socket.on('room joined', function(msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  // 해당 채팅방에 다른 클라이언트들에게 메시지 전송
  socket.on('new user', function(msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  // 서버에서 받은 채팅 메시지를 화면에 표시
  // data = {id : nick, msg : msg}
  socket.on('chat message', function(data) {
    let item = document.createElement('li');
    item.textContent = `${data.id} : ${data.msg}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
});
