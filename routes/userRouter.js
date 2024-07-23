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
            // req.session.point = rows[0].point;
            // req.session.user_id = rows[0].user_id;
            // req.session.tel = rows[0].tel;
            // req.session.point = rows[0].point;
            // req.session.email = rows[0].email;
            // req.session.user_date = rows[0].user_date;
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

// 마이페이지 경로로 접근했을 때!
// router.post('/myPage', (req, res) => {
//     console.log(req.body);
//     let { id } = req.body;
//     let sql = 'SELECT * FROM User_TB WHERE user_id = ?';
//     req.conn.query(sql, [id], (err, rows) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Internal Server Error');
//         }

//         console.log('select 결과값: ', rows);
//         console.log("값 들어옴!");
//         if (rows.length > 0) {
//             req.session.nick = rows[0].nick;
//             req.session.point = rows[0].point;
//             req.session.user_id = rows[0].user_id;
//             req.session.tel = rows[0].tel;
//             req.session.email = rows[0].email;
//             req.session.user_date = rows[0].user_date;
//             res.redirect("/myPage")
//         }
//     });
// });

// router.get("/myPage", (req, res) => {
//     console.log('Session:', req.session);
    
//     if (req.session && req.session.user_id) {
//         try {
//             // 날짜 포맷팅 함수
//             function formatDate(date) {
//                 const year = date.getFullYear();
//                 const month = String(date.getMonth() + 1).padStart(2, '0');
//                 const day = String(date.getDate()).padStart(2, '0');
//                 let hours = date.getHours();
//                 const minutes = String(date.getMinutes()).padStart(2, '0');
//                 const ampm = hours >= 12 ? '오후' : '오전';
                
//                 hours = hours % 12;
//                 hours = hours ? String(hours).padStart(2, '0') : '12';
                
//                 return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
//             }

//             const joinDate = new Date(req.session.user_date); // 데이터베이스에서 가져온 날짜
//             const formattedJoinDate = formatDate(joinDate);
//             console.log('Formatted Join Date:', formattedJoinDate);

//             res.render("myPage", {
//                 nick: req.session.nick,
//                 point: req.session.point,
//                 user_id: req.session.user_id,
//                 tel: req.session.tel,
//                 email: req.session.email,
//                 user_date: formattedJoinDate
//             });
//         } catch (error) {
//             console.error('Error formatting date or rendering page:', error);
//             res.status(500).send('Internal Server Error');
//         }
//     } else {
//         res.render("myPage");
//     }
// });



module.exports = router;