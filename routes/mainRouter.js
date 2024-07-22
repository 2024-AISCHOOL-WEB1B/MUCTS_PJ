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

// 사용자가 프로필화면을 요청했을 때
router.get("/profile",(req,res)=>{
    
    if(req.session){
        res.render("profile",
            { nick : req.session.nick,
              point : req.session.point  
            });
            
    }else {
        res.render("profile")
    }
});

router.get("/myPage",(req,res)=>{
    console.log(req.session);
    if(req.session){
        res.render("myPage",
            { nick : req.session.nick,
              point : req.session.point,  
              user_id : req.session.id,
              tel : req.session.tel,
              email : req.session.email,
              user_date : req.session.user_date
            });
    }else{
        res.render("profile")
    }
})




module.exports = router;