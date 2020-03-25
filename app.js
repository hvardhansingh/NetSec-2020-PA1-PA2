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

app.get('/des/compare', function(req, res){
    res.render('compare/index');
});

app.post('/des/compare/key', function(req, res){
    var key1 = req.body.des.key1;
    var key2 = req.body.des.key2;
    var ptxt = req.body.des.ptxt;
    var n = req.body.des.rounds;
    var w = req.body.des.halfwidth;

    ptxt = encrypt.hex2bin(ptxt);
    key1 = encrypt.hex2bin(key1).substring(0,2*(Number(w)));
    key2 = encrypt.hex2bin(key2).substring(0,2*(Number(w)));
    var blocks = encrypt.makeBlocks(ptxt, w);
    var subkeys1 = kg.generateSubKeys(key1,w,n);
    var subkeys2 = kg.generateSubKeys(key2,w,n);

    var enc1 = "";
    blocks.forEach(function(block){
        enc1+= encrypt.bin2hex(encrypt.encipher(block,subkeys1,w,n));
    });

    var round1 = init.rounds;
    init.rounds = [];

    var enc2 = "";
    blocks.forEach(function(block){
        enc2+= encrypt.bin2hex(encrypt.encipher(block,subkeys2,w,n));
    });

    var round2 = init.rounds;
    init.rounds = [];

    var delta = [];

    for(var i=0; i<=n; i++){

        var xr = encrypt.XOR(round1[i], round2[i]);
        round1[i] = encrypt.bin2hex(round1[i]);
        round2[i] = encrypt.bin2hex(round2[i]);
        
        var popCnt = 0;
        for(var j=0; j<xr.length; j++){
            if(xr[j]==="1") popCnt++;
        }
        var obj = {
            x: i+1,
            y: popCnt
        };
        delta.push(obj);
    }

    var obj = {
        key1: req.body.des.key1,
        key2: req.body.des.key2,
        ptxt: req.body.des.ptxt,
        ctxt1: enc1,
        ctxt2: enc2,
        round1: round1,
        round2: round2,
        delta: delta
    };

    res.render('compare/show', {des: obj});

});

app.post('/des/compare/plaintext', function(req, res){
    var key = req.body.des.key;
    var ptxt1 = req.body.des.ptxt1;
    var ptxt2 = req.body.des.ptxt2;
    var n = req.body.des.rounds;
    var w = req.body.des.halfwidth;

    ptxt1 = encrypt.hex2bin(ptxt1);
    ptxt2 = encrypt.hex2bin(ptxt2);
    key = encrypt.hex2bin(key).substring(0,2*(Number(w)));
    
    var blocks1 = encrypt.makeBlocks(ptxt1, w);
    var blocks2 = encrypt.makeBlocks(ptxt2, w);
    var subkeys = kg.generateSubKeys(key,w,n);

    var enc1 = "";
    blocks1.forEach(function(block){
        enc1+= encrypt.bin2hex(encrypt.encipher(block,subkeys,w,n));
    });

    var round1 = init.rounds;
    init.rounds = [];

    var enc2 = "";
    blocks2.forEach(function(block){
        enc2+= encrypt.bin2hex(encrypt.encipher(block,subkeys,w,n));
    });

    var round2 = init.rounds;
    init.rounds = [];

    var delta = [];

    for(var i=0; i<=n; i++){

        var xr = encrypt.XOR(round1[i], round2[i]);
        round1[i] = encrypt.bin2hex(round1[i]);
        round2[i] = encrypt.bin2hex(round2[i]);
        
        var popCnt = 0;
        for(var j=0; j<xr.length; j++){
            if(xr[j]==="1") popCnt++;
        }
        var obj = {
            x: i+1,
            y: popCnt
        };
        delta.push(obj);
    }

    var obj = {
        key: req.body.des.key,
        ptxt1: req.body.des.ptxt1,
        ptxt2: req.body.des.ptxt2,
        ctxt1: enc1,
        ctxt2: enc2,
        round1: round1,
        round2: round2,
        delta: delta
    };

    res.render('compare/show', {des: obj});
});

app.listen(3000, function(){
    console.log('Serving at port 3000');
});