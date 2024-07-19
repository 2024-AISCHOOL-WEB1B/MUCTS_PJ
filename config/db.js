// DB와 연결정보를 관리하는 공간
const mysql = require("mysql2");

// DB패스워드 암호화변수
const dbPassword = process.env.DB_PASSWORD;

// DB연결정보를 설정
const conn = mysql.createConnection({
    host : "localhost",
    port : '3307',
    user : "Insa5_JSB_hacksim_5",
    password : dbPassword,
    database : "Insa5_JSB_hacksim_5"
});

// 연결 진행 !  이거는 모듈이다!
conn.connect();   //DB연결해라~
console.log("DB연결!"); 

module.exports = conn;  //모듈 문 만들기!!