const express = require("express");
const router = express.Router();
const conn = require("../config/db");

// 1.충전
router.post("/charge", (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).send('로그인이 필요합니다.');
    }

    let { charge_money } = req.body;
    charge_money = parseFloat(charge_money);

    if (isNaN(charge_money)) {
        console.error('유효하지 않은 금액:', charge_money);
        return res.status(400).send('유효하지 않은 금액입니다.');
    }

    // 1. 충전 기록을 Charge_TB에 추가
    let chargeSql = "INSERT INTO Charge_TB (user_id, charge_money) VALUES (?, ?)";
    conn.query(chargeSql, [user_id, charge_money], (err) => {
        if (err) {
            console.error('충전 기록 저장 오류:', err);
            return res.status(500).send('서버 오류');
        }

        // 2. User_TB에서 누적 금액 업데이트
        let updateSql = `
            UPDATE User_TB
            SET point = COALESCE(point, 0) + ?
            WHERE user_id = ?`;
        conn.query(updateSql, [charge_money, user_id], (err) => {
            if (err) {
                console.error('누적 금액 업데이트 오류:', err);
                return res.status(500).send('서버 오류');
            }

            res.send('충전 완료!');
        });
    });
});

// 2. 금액 조회
router.post("/money", (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).send('로그인이 필요합니다.');
    }

    let selectSql = "SELECT point FROM User_TB WHERE user_id = ? LIMIT 1";
    conn.query(selectSql, [user_id], (err, rows) => {
        if (err) {
            console.error('데이터베이스 쿼리 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (rows.length > 0) {
            let remainingMoney = rows[0].point;  // 올바른 필드명을 사용
            res.send(`현재 금액: ${remainingMoney}`);
        } else {
            res.send('잔액 정보가 없습니다.');
        }
    });
});




// 3.사용할 금액
router.post("/use", (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).send('로그인이 필요합니다.');
    }

    let { charge_money } = req.body;
    charge_money = parseFloat(charge_money);

    if (isNaN(charge_money) || charge_money <= 0) {
        console.error('유효하지 않은 금액:', charge_money);
        return res.status(400).send('유효하지 않은 금액입니다.');
    }

    // 1. User_TB에서 현재 포인트 조회
    let selectUserSql = "SELECT point FROM User_TB WHERE user_id = ? LIMIT 1";
    conn.query(selectUserSql, [user_id], (err, rows) => {
        if (err) {
            console.error('데이터베이스 쿼리 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (rows.length > 0) {
            let currentPoints = rows[0].point;

            // 2. 포인트가 충분한지 확인
            if (currentPoints < charge_money) {
                console.log("잔액 부족");
                return res.send('잔액이 부족합니다.');
            }

            // 3. Charge_TB에 음수 값으로 포인트 사용 기록 추가
            let insertChargeSql = "INSERT INTO Charge_TB (user_id, charge_money) VALUES (?, ?)";
            conn.query(insertChargeSql, [user_id, -charge_money], (err) => {
                if (err) {
                    console.error('포인트 사용 기록 저장 오류:', err);
                    return res.status(500).send('서버 오류');
                }

                // 4. User_TB에서 포인트 차감
                let updateUserSql = `
                    UPDATE User_TB
                    SET point = point - ?
                    WHERE user_id = ?`;
                conn.query(updateUserSql, [charge_money, user_id], (err) => {
                    if (err) {
                        console.error('데이터베이스 쿼리 오류:', err);
                        return res.status(500).send('서버 오류');
                    }

                    // 5. 최종 결과 응답
                    res.send(`포인트 사용 완료! 남은 포인트: ${currentPoints - charge_money}`);
                });
            });
        } else {
            console.log("잔액 정보가 없음");
            res.send('잔액 정보가 없습니다.');
        }
    });
});


module.exports = router;