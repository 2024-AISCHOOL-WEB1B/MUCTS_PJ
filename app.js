// DB암호화모듈인 dotenv 불러오기
require('dotenv').config();

const express = require('express');
const http = require('http');
const bp = require('body-parser')
const nunjucks = require('nunjucks');
// socket.io 핸들러 불러오기
const socketHandler = require('./public/socketHandler');



// router 불러오기
const mainRouter = require('./routes/mainRouter');
const userRouter = require("./routes/userRouter");

// 서버 실행
const app = express();
const server = http.createServer(app);

// socket io 핸들러 실행
socketHandler(server);



// 세션 저장
const session = require('express-session');
const fileStore = require('session-file-store')(session);

// statitc 파일 등록
app.use(express.static("public"));

// post데이터 처리 등록
app.use(bp.urlencoded({extended : true}));

// router 등록
app.use('/', mainRouter)
app.use('/user', userRouter)

// 세션 관련 설정 정보
app.use(session({
    httpOnly : true,
    resave : false,
    secret : "secret",
    store : new fileStore(),
    saveUninitialized : false
}));

// nunjucks
app.set("view engine", "html");
nunjucks.configure("views", {
    express : app,
    watch : true
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
});