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

module.exports = router;