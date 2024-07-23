const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.render('chat.html');
});

router.get('/session', (req, res) => {
    if(req.session.nick){
        console.log("chatRouter에서 닉네임을 보냈습니다!", req.session.nick)
        res.json({nick : req.session.nick});
    }
    else{
        res.status(401).json({ message : '세션이 존재하지 않습니다!'});
    }
})

module.exports = router;