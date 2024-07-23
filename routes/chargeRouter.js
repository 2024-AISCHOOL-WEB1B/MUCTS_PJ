const express = require("express");
const router = express.Router();
const conn = require("../config/db");

// 1.충전
router.post("/charge", (req, res) => {
    // 1. 프론트에서 넘어온 데이터 확인하기
    console.log("넘어온 데이터:", req.body);
    let { user_id, charge_money } = req.body;
    

    // 2. db와 연결해서 데이터 처리
    // 2-1. 아이디가 기존에 존재하는지 확인하는 쿼리
    let checkSql = "SELECT * FROM Charge_TB WHERE user_id = ?";
    conn.query(checkSql, [user_id], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            res.send("<script>alert('DB 오류 발생')</script>");
            return;
        }

        if (results.length > 0) {
            // 아이디가 존재하면 업데이트 쿼리 실행
            let updateSql = "UPDATE Charge_TB SET charge_money = charge_money + ? WHERE user_id = ?";
            conn.query(updateSql, [charge_money, user_id], (err, rows) => {
                if (err) {
                    console.error("DB update error:", err);
                    res.send("<script>alert('입금 실패')</script>");
                    return;
                }
                console.log("db update:", rows);
                res.redirect("/charge");
            });
        } else {
            // 아이디가 존재하지 않으면 삽입 쿼리 실행
            let insertSql = "INSERT INTO Charge_TB ( user_id, charge_money) VALUES (?,?)";
            conn.query(insertSql, [user_id, charge_money], (err, rows) => {
                if (err) {
                    console.error("DB insert error:", err);
                    res.send("<script>alert('입금 실패')</script>");
                    return;
                }
                console.log("db insert:", rows);
                res.redirect("/charge");
            });
        }
    });
});


// 2.  금액조회
router.post("/money",(req,res)=>{
    // 사용자가 보낸 user_id,pw로 db를 검증하는 목적

    console.log("문자형태로 넘어온 데이터",req.body);
    let {user_id } = req.body

    // 1.sql 쿼리문 작성
    let sql = "SELECT * FROM Charge_TB  WHERE user_id = ?";

    // 2.conn쿼리문 실행
    conn.query(sql,[user_id],(err,rows)=>{
        console.log(rows);
        if (rows.length > 0) {
            console.log("입금 성공");
            req.session.money = rows[0].charge_money;
            res.send(`충전된 금액: ${rows[0].charge_money }`)
        } else {
            console.log("조회 실패");
        }
    })
})

// 3.사용할 금액
router.post("/use", (req, res) => {
    console.log(req.body);
    let { user_id, charge_money } = req.body;
    charge_money = parseFloat(charge_money); // Ensure charge_money is a number

    if (isNaN(charge_money)) {
        console.error('유효하지 않은 금액:', charge_money);
        return res.status(400).send('유효하지 않은 금액입니다.');
    }

    // 금액 차감 쿼리
    let updateSql = "UPDATE Charge_TB SET charge_money = charge_money - ? WHERE user_id = ? AND charge_money >= ?";
    conn.query(updateSql, [charge_money, user_id, charge_money], (err, result) => {
        if (err) {
            console.error('데이터베이스 쿼리 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (result.affectedRows > 0) {
            // 차감 후 남은 금액 조회
            let selectSql = "SELECT charge_money FROM Charge_TB WHERE user_id = ? LIMIT 1";
            conn.query(selectSql, [user_id], (err, rows) => {
                if (err) {
                    console.error('데이터베이스 쿼리 오류:', err);
                    return res.status(500).send('서버 오류');
                }

                if (rows.length > 0) {
                    let remainingMoney = rows[0].charge_money;
                    console.log("금액 사용 성공");
                    res.send(`남은 금액: ${remainingMoney}`);
                } else {
                    console.log("테이블 비어 있음");
                    res.send('잔액 정보가 없습니다.');
                }
            });
        } else {
            console.log("금액 사용 실패");
            res.send('잔액이 부족합니다.');
        }
    });
});


module.exports = router;