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
    res.render('landing');
});

app.get('/des/encipher', function(req, res){
    res.render('encrypt/index');
});

app.post('/des/encipher', function(req, res){

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

    for(var i=0; i<subkeys.length; i++){
        subkeys[i] = encrypt.bin2hex(subkeys[i]);
    }

    var des = {
        key: encrypt.bin2hex(key),
        subkeys: subkeys,
        ptxt: encrypt.bin2hex(ptxt),
        ctxt: enc
    };
    // res.send("This is post req page");
    res.render('encrypt/show', {des: des});
});

app.get('/des/decipher', function(req, res){
    res.render('decrypt/index');
});

app.post('/des/decipher', function(req, res){

    var n = req.body.des.rounds;
    var w = req.body.des.halfwidth;
    var key = req.body.des.key;
    var ctxt = req.body.des.ctxt;
    console.log(n);
    console.log(w);
    console.log(key);
    console.log(ctxt);
    ctxt = encrypt.hex2bin(ctxt);
    key = encrypt.hex2bin(key).substring(0,2*(Number(w)));
    var blocks = encrypt.makeBlocks(ctxt, w);
    var subkeys = kg.generateSubKeys(key,w,n);
    subkeys.reverse();

    var dec = "";
    blocks.forEach(function(block){
        dec+= encrypt.bin2hex(encrypt.encipher(block,subkeys,w,n));
    });

    for(var i=0; i<subkeys.length; i++){
        subkeys[i] = encrypt.bin2hex(subkeys[i]);
    }

    var des = {
        key: encrypt.bin2hex(key),
        subkeys: subkeys,
        ctxt: encrypt.bin2hex(ctxt),
        ptxt: dec
    };

    res.render('decrypt/show', {des: des});

});

app.listen(3001, function(){
    console.log('Serving at port 3001');
});