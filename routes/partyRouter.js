const express = require('express');
const router = express.Router();
// mysql db와 연결
const conn = require("../config/db");


// 파티만들기 버튼을 누를때 계좌가 없을 때
router.get('/checkAccount', (req, res) => {
    const userId = req.session.user_id; // 세션에서 user_id를 가져옴

    if (!userId) {
        return res.status(401).send('로그인해야 가능한 서비스 입니다.');
    }

    const query = 'SELECT wd_account, ba_number FROM User_TB WHERE user_id = ?';
    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const hasAccount = results.length > 0 && results[0].wd_account && results[0].ba_number;
            res.json({ hasAccount });
        }
    });
});

// 계좌 등록 라우트
router.post('/registerAccount', (req, res) => {
    const userId = req.session.user_id; // 세션에서 user_id를 가져옴
    const { wd_account, ba_number } = req.body;

    if (!userId) {
        return res.status(401).send('로그인해야 가능한 서비스 입니다.');
    }

    const query = 'UPDATE User_TB SET wd_account = ?, ba_number = ? WHERE user_id = ?';
    conn.query(query, [wd_account, ba_number, userId], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            res.status(500).send('서버에러!');
        } else {
            // res.redirect('makeParty');
            res.send(`
                <script>
                    alert('계좌가 성공적으로 등록되었습니다!');
                    window.location.href='/party/makeParty';
                </script>
            `)
        }
    });
});

// 파티 만들기 페이지 라우트
router.get('/makeParty', (req, res) => {
    res.render('makeparty',
        {
            user : req.session.user_id
        });
});

module.exports = router;



// 파티 만들기에서 데이터가 들어왔을 때 처리
router.post('/makeParty', (req, res) => {
    const { party_title, personnel, min_amount } = req.body;
    const user_id = req.session.user_id;

    const sql = `
        INSERT INTO Party_TB (user_id, party_status, party_title, personnel, min_amount)
        VALUES (?, 1, ?, ?, ?)
    `;
    conn.query(sql, [user_id, party_title, personnel, min_amount], (err, rows) => {
        if (err) {
            console.error("데이터베이스 에러!", err);
            res.send("<script>alert('파티만들기 실패..'); history.back();</script>");
        } else {
            res.send(`
                <script>
                    alert('파티만들기 성공!');
                    window.location.href='/';
                </script>`
            );
        }
    });
});


module.exports = router;