// 회원정보를 DB에 연결해서 관리하는 라우터
const express = require("express")
const router = express.Router();

// mysql db와 연결
const conn = require("../config/db");

// 회원가입 경로로 접근했을 때!
router.post("/join", (req, res) => {
   // 주소입력창에 우편번호,도로명주소,상세주소 ==> 총 주소 1개변수로 병합하는 코드
    const { id, pw, nick, addr1, addr2, addr3, email, birth_date, gender, tel, wd_account, ba_number } = req.body;
    const adress = `${addr3} ${addr1} ${addr2}`; // 합친 주소 필드
    
    let sql = "insert into User_TB value(?,?,?,?,?,?,?,?,0,?,?,CURRENT_TIMESTAMP())";
    conn.query(sql, [id, pw, nick,adress,email,birth_date,gender,tel,wd_account,ba_number], (err, rows) => {
        console.log("insert 결과값 : ", rows);
        if (rows) {
            //회원가입에 성공했을 때, 로그인창으로 이동!
            res.send(`
                <script>
                    alert('회원가입 성공!');
                    window.location.href='/login';
                </script>`
            );
        } else {
            res.send("<script>alert('회원가입 실패..'); history.back();</script>");
        }
    })
})

router.post("/login", (req, res) => {
    console.log("넘어온 데이터", req.body);
    let { id, pw } = req.body;

    let sql = "select * from User_TB where user_id=? and pw=?";
    
    conn.query(sql, [id, pw], (err, rows) => {
        
        console.log("select 결과값: ", rows);

        if (rows.length > 0) { 
            console.log(rows[0]);
            req.session.nick = rows[0].nick;
            req.session.point = rows[0].point;
            req.session.user_id = rows[0].user_id;
            req.session.tel = rows[0].tel;
            req.session.email = rows[0].email;
            req.session.user_date = rows[0].user_date;

            // 한 데이터처리안에 send와 redirect가 같이 처리할 수 없기 때문에 window.location.href='/'를 사용해서
            // 로그인 성공 후 성공alert창을 띄운 후에 정보를 저장해서 메인으로 보냄(redirect와 같음);
            res.send(`
                <script>
                    alert('로그인 성공: ${rows[0].nick}님 환영합니다!');
                    window.location.href='/';
                </script>
            `)
            
        } else {
            res.send("<script>alert('로그인 실패..'); history.back();</script>");
        }
    });
});


module.exports = router;