const express = require('express');
const router = express.Router();

router.get("/makeParty", (req, res) => {
    res.render("makeParty");
});


module.exports = router;