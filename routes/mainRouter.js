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

module.exports = router;