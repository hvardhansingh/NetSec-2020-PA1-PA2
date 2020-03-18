var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    encrypt = require('./encrypt.js'),
    init = require('./init.js'),
    kg = require('./keyGeneration.js');
    
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes 

app.get('/', function(req, res){
    res.redirect('/des');
});

app.get('/des', function(req, res){
    res.render('index');
});

app.post('/des', function(req, res){

    var n = req.body.des.rounds;
    var w = req.body.des.halfwidth;
    var key = req.body.des.key;
    var ptxt = req.body.des.ptxt;

    ptxt = encrypt.hex2bin(ptxt);
    key = encrypt.hex2bin(key).substring(0,2*(Number(w)));
    var blocks = encrypt.makeBlocks(ptxt, w);
    var subkeys = kg.generateSubKeys(key,w,n);

    // res.send(blocks);

    var enc = "";
    blocks.forEach(function(block){
        enc+= encrypt.bin2hex(encrypt.encipher(block,subkeys,w,n));
    });
    var des = {
        subkeys: subkeys,
        ptxt: ptxt,
        ctxt: enc
    };
    // res.send("This is post req page");
    res.render('encipher', {des: des});
});


app.listen(3000, function(){
    console.log('Serving at port 3000');
});