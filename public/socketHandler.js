const socketIo = require('socket.io');

module.exports = function(server) {

  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('소켓 연결됨:', socket.id);

    // 클라이언트가 특정 채팅방에 join 요청 처리
    socket.on('join room', (roomId) => {
      socket.roomId = roomId
      socket.join(roomId); // 해당 채팅방에 소켓을 join 시킴
      console.log(`소켓 ${socket.id}가 ${roomId} 채팅방에 입장함`);

      // 클라이언트에게 채팅방 입장 메시지 전송
      socket.emit('room joined', `room ${roomId}에 입장하셨습니다.`);

      // 해당 채팅방에 다른 클라이언트들에게 메시지 전송
      socket.to(roomId).emit('new user', `${socket.id}님이 입장하셨습니다.`);
    });

    // 클라이언트가 메시지를 보낼 때 처리
    socket.on('chat message', (msg) => {
      console.log(`소켓 ${socket.id} : ${msg}`);

      // 해당 채팅방에 속한 모든 클라이언트에게 메시지 전송
      io.to(socket.roomId).emit('chat message', {id : socket.id, msg : msg});
    });

    socket.on('disconnect', () => {
      console.log('소켓 연결 해제됨:', socket.id);
      
      // 해당 채팅방에서 퇴장
      if(socket.roomId){
        socket.leave(socket.roomId);
      }
    });
  });
};