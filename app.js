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
const chargeRouter = require("./routes/chargeRouter")
const partyRouter = require("./routes/partyRouter");

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
app.use('/charge',chargeRouter);
app.use('/party',partyRouter);

// nunjucks
app.set("view engine", "html");
nunjucks.configure("views", {
    express : app,
    watch : true
});




// 여기부터 채팅방 코드입니다.
// socketio 웹소켓 연결 시
let roomList = {};
let maxRoomCapacity = 4; // 임시값
io.on('connection', (socket) => {
    let roomId;
    let nick;
    console.log(`클라이언트 ${socket.id} 접속`);

    // 클라이언트가 채팅방에 들어감
    socket.on('enter room', (data)=>{
        roomId = data.roomId;
        nick = data.nick||"Geust";

        // 객체에 방 생성
        if(!roomList[roomId]){
            roomList[roomId] = [];
            console.log('roomList에 roomId가 없을 때 추가', 'roomList[roomId]', roomList[roomId]);
        }
        
        if(roomList[roomId].length >= maxRoomCapacity){
            socket.emit('full room', "방 인원이 가득 찼습니다.. 뒤로가기 해주세요ㅠㅠ");
            socket.disconnect();
            return; // 연결 종료
        }
        
        // 사용자 추가
        if(roomList[roomId].indexOf(nick) === -1){
            roomList[roomId].push(nick);
        }
        
        console.log('채팅방 입장할 때 : ', data, roomList);

        socket.join(roomId);
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
        /*
        Optional Chaining 연산자는 객체의 깊은 프로퍼티에 접근할 때,
        그 중간에 null 또는 undefined가 있어도 오류를 발생시키지 않고 undefined를 반환합니다. 
        이는 코드의 안정성을 높이고, 중간 값이 null 또는 undefined인 경우에 대한 예외 처리를 쉽게 해줍니다.
        */
        if (roomList[roomId]) {
            const idx = roomList[roomId].indexOf(nick);
            if (idx !== -1) {
                roomList[roomId].splice(idx, 1); // 요소 삭제
            }
    
            // 방이 비어있다면 방 제거
            if (roomList[roomId].length === 0) {
                delete roomList[roomId];
            }
        }

        console.log(`클라이언트 ${socket.id} 접속 해제`);
        console.log('접속 해제 하고', roomList[roomId], roomList[roomId]?.length);
    });
});
// 채팅방 코드 끝!



const PORT = 3000;
server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
});