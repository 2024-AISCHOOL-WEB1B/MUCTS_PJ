const express = require("express");
const router = express.Router();

router.get("/", (req, res)=>{
    // if (req.session.닉네임){
    //     res.render("main", {닉네임: 보내줄 닉네임})
    // }
    // else{
        res.render("main");
    // }
});


// 사용자가 회원가입을 요청했을 때!
router.get("/join",(req,res)=>{
    res.render("join");
})

module.exports = router;