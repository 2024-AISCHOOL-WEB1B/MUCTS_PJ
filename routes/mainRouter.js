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


// 사용자가 마이페이지화면을 요청했을 때
router.get("/myPage",(req,res)=>{
    console.log(req.session);
    if(req.session){

        // 날짜 포멧팅하는 함수
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
            const day = String(date.getDate()).padStart(2, '0');
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? '오후' : '오전';
            
            hours = hours % 12; // 12시간제로 변환
            hours = hours ? String(hours).padStart(2, '0') : '12'; // 0시를 12시로 변환
        
            return `${year}년 ${month}월${day}일 ${ampm} ${hours}:${minutes}`;
        }

        const joinDate = new Date(req.session.user_date); // 데이터베이스에서 가져온 날짜
        const formattedJoinDate = formatDate(joinDate);
        console.log(formattedJoinDate); // 출력 예: "2024년/07월22일/오전 12:22"

        res.render("myPage",
            { nick : req.session.nick,
              point : req.session.point,  
              user_id : req.session.user_id,
              tel : req.session.tel,
              email : req.session.email,
              user_date : formattedJoinDate
            });
    }else{
        res.render("myPage")
    }
})

router.get("/charge",(req,res)=>{
    res.render("charge");
})

router.get("/PartyRoom",(req,res)=>{
    res.render("PartyRoom");
})

module.exports = router;