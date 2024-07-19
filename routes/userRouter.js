// 회원정보를 DB에 연결해서 관리하는 라우터
const express = require("express")
const router = express.Router();
const conn = require("../config/db");


// 1.회원가입 경로로 접근했을 때!
router.post("/join", (req, res) => {
    //1.프론트에서 넘어온 데이터 확인하기!
    // *post로 넘긴 데이터는 req안에 body로 존재한다!
    console.log("넘어온 데이터: ", req.body);     //확인작업
    let { id, pw, nick, adress, email, birth_date, gender, tel, wd_account, ba_number } = req.body;   //컬럼의 키값 순서대로 작성해야함.

    //2.DB와 연결해서 데이터 처리
    // 1) 처리할 sql문장 필요
    // 2) 입력할 데이터가 필요한 경우 => 값을 넣어주기! 
    // 3) 처리할 콜백함수 
    let sql = "insert into User_TB value(?,?,?,?,?,?,?,?,0,?,?)"
    conn.query(sql, [id, pw, nick,adress,email,birth_date,gender,tel,0,wd_account,ba_number], (err, rows) => {
        console.log("DB insert : ", rows);
        if (rows) {
            //가입에 성공했을 때, 메인으로 이동!
            res.redirect("/")
        } else {
            //가입에 실패했을 때, 실패했다는 알림을 띄워주세여.
            // alert를 바로 사용하면 될까? 여기는 백앤드..그래서 alert라는 '기능'을 사용자에게 돌려줘야함.
            // => 그래서 사용하는게 sand().
            // send()안에 적어야 하는 것 ? res.send("alert('로그인실패')") 이렇게 쓰면 땡!!!땡!!!
            // send()안에는 html공간이므로 스크립트를 써줘야함.
            res.send("<script>alert('회원가입실패')</script>")

        }
    })
})