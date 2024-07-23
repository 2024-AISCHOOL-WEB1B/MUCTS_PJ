// 회원정보를 DB에 연결해서 관리하는 라우터
const express = require("express")
const router = express.Router();

// mysql db와 연결
const conn = require("../config/db");

// 회원가입 경로로 접근했을 때!
router.post("/join", (req, res) => {
    // 주소입력창에 우편번호,도로명주소,상세주소 ==> 총 주소 1개변수로 병합하는 코드
    const { user_id, pw, nick, addr1, addr2, addr3, email, birth_date, gender, tel, wd_account, ba_number } = req.body;
    const adress = `${addr3} ${addr1} ${addr2}`; // 합친 주소 필드

    let sql = "insert into User_TB value(?,?,?,?,?,?,?,?,0,?,?,CURRENT_TIMESTAMP())";
    conn.query(sql, [user_id, pw, nick, adress, email, birth_date, gender, tel, wd_account, ba_number], (err, rows) => {
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
    let { user_id, pw } = req.body;

    let sql = "select * from User_TB where user_id=? and pw=?";

    conn.query(sql, [user_id, pw], (err, rows) => {


        console.log("select 결과값: ", rows);

        if (rows.length > 0) {
            console.log(rows[0]);
            req.session.user_id = rows[0].user_id;
            req.session.nick = rows[0].nick;
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
router.get("/myPage", (req, res) => {
    console.log(req.session.user_id);
    let user_id = req.session.user_id;
    let sql = "select * from User_TB where user_id=?";

    conn.query(sql, [user_id], (err, rows) => {


        if (rows.length > 0) {

            // 날짜 포멧팅 해주는 함수
            function formatDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                let hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? '오후' : '오전';
                hours = hours % 12;
                hours = hours ? String(hours).padStart(2, '0') : '12';

                return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
            }

            const joinDate = new Date(rows[0].user_date);
            const formattedJoinDate = formatDate(joinDate);
            res.render("myPage",
                {
                    user: rows[0],
                    user_date: formattedJoinDate
                });
        } else {
            res.render("myPage", { user: null });
        }
    })
})



module.exports = router;