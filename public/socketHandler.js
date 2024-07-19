const socketIo = require('socket.io');

// 경로 수정을 도와주는 모듈
const path = require("path");
const file_path = path.join(__dirname, "../routes");

// router 등록 해야 하는데 아직 안함!!!!!!!!!!!!!!!!!!!!!!!!!!

module.exports = function(server) {
    const io = socketIo(server);
  
    io.on('connection', (socket) => {
      console.log('소켓 연결됨:', socket.id);
  
      // 클라이언트가 특정 채팅방에 join 요청 처리
      socket.on('join room', (roomId) => {
        socket.join(roomId); // 해당 채팅방에 소켓을 join 시킴
        console.log(`소켓 ${socket.id}가 ${roomId} 채팅방에 입장함`);
  
        // 클라이언트에게 채팅방 입장 메시지 전송 (예: 채팅방 이름 등)
        socket.emit('room joined', `You joined room ${roomId}`);
  
        // 해당 채팅방에 다른 클라이언트들에게 메시지 전송
        socket.to(roomId).emit('new user', `New user joined room ${roomId}`);
      });
  
      // 클라이언트가 메시지를 보낼 때 처리
      socket.on('chat message', (roomId, msg) => {
        console.log(`소켓 ${socket.id}로부터 ${roomId} 채팅방에서 메시지 받음: ${msg}`);
  
        // 해당 채팅방에 속한 모든 클라이언트에게 메시지 전송
        io.to(roomId).emit('chat message', msg);
      });
  
      socket.on('disconnect', () => {
        console.log('소켓 연결 해제됨:', socket.id);
      });
    });
  };
  