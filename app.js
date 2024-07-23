// DB암호화모듈인 dotenv 불러오기
require('dotenv').config();

const express = require('express');
const http = require('http');
const bp = require('body-parser')
const nunjucks = require('nunjucks');

// router 불러오기
const mainRouter = require('./routes/mainRouter');
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");

// 서버 실행
const app = express();
const server = http.createServer(app);

// socket.io에 서버 정보를 넘겨주고 구동
const socketIo = require('socket.io');
const io = socketIo(server);

// statitc 파일 등록
app.use(express.static("public"));

// 세션 모듈
const session = require('express-session');
const fileStore = require('session-file-store')(session);

// 세션 미들웨어 설정
const sessionMiddleware = session({
    httpOnly: true,
    resave: false,
    secret: "secret",
    store: new fileStore(),
    saveUninitialized: false
  });

app.use(sessionMiddleware)

// post데이터 처리 등록
app.use(bp.urlencoded({extended : true}));

// router 등록
app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);

// nunjucks
app.set("view engine", "html");
nunjucks.configure("views", {
    express : app,
    watch : true
});




// 여기부터 채팅방 코드입니다.
// socketio 웹소켓 연결 시
io.on('connection', (socket) => {
    let roomId;
    let nick;
    console.log(`클라이언트 ${socket.id} 접속`);

    // 클라이언트가 채팅방에 들어감
    socket.on('enter room', (data)=>{
        roomId = data.roomId;
        nick = data.nick;
        console.log('채팅방 입장할 때 : ', data);

        socket.join(roomId);
        console.log('엔터', socket.rooms);
        console.log(`사용자 ${nick}가 방 ${roomId}에 입장`);
    
        // 입장한 사용자에게 메시지 전송
        socket.emit('you joined room', `${roomId} 방에 입장하셨습니다.`);

        // 같은 채팅방에 있는 기존 클라이언트에게 메시지 전송
        socket.to(roomId).emit('new user', `${nick}님께서 ${roomId} 방에 입장하셨습니다!`);
    });

    // 클라이언트가 입력한 채팅 받기
    socket.on('send message', (msg) => {
        console.log(socket.rooms);
        console.log(`${msg} from ${socket.id} room ${roomId}`);

        // 클라이언트에게 받은 메시지를 같은 방에 있는 모든 사용자에게 반환
        // socket.emit('return message', msg);
        io.to(roomId).emit('return message', msg);
    })


    // 연결 종료
    socket.on('disconnect', () => {
        console.log(`클라이언트 ${socket.id} 접속 해제`);
    });
})
// 채팅방 코드 끝!



const PORT = 3000;
server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
});