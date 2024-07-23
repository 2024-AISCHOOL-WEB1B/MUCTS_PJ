const express = require("express");
const router = express.Router();



router.get("/", (req, res) => {
    res.render("main");
});


// 사용자가 회원가입을 요청했을 때!
router.get("/join",(req,res)=>{
    res.render("join");
})

//  사용자가 로그인을 요청했을 때
router.get("/login",(req,res)=>{
    res.render("login");
})


router.get("/myPage", (req, res) => {
    console.log(req.session); // 세션 정보 출력

    if (req.session && req.session.user_id) {
        let sql = "SELECT * FROM User_TB WHERE user_id = ?";
        
        req.conn.query(sql, [req.session.user_id], (err, rows) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (rows.length > 0) {
                // 최신 세션 정보로 업데이트
                req.session.nick = rows[0].nick;
                req.session.point = rows[0].point;
                req.session.tel = rows[0].tel;
                req.session.email = rows[0].email;
                req.session.user_date = rows[0].user_date;

                // 날짜 포맷팅 함수
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

                const joinDate = new Date(req.session.user_date);
                const formattedJoinDate = formatDate(joinDate);
                console.log(formattedJoinDate); // 출력 예: "2024년 07월 22일 오후 12:22"

                res.render("myPage", {
                    nick: req.session.nick,
                    point: req.session.point,
                    user_id: req.session.user_id,
                    tel: req.session.tel,
                    email: req.session.email,
                    user_date: formattedJoinDate
                });
            } else {
                res.render("myPage"); // 사용자 정보가 없을 경우
            }
        });
    } else {
        res.render("myPage"); // 로그인하지 않은 경우
    }
});





module.exports = router;