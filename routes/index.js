var express = require('express');
var router = express.Router();

var encryptBlowfish = require('../blowfish/encrypt');
var initBlowfish = require('../blowfish/init');
var kgBlowfish = require('../blowfish/keyGeneration');

var encryptDES = require('../des/encrypt');
var initDES = require('../des/init');
var kgDES = require('../des/keyGeneration');

// ================================= INDEX ROUTE ======================================
router.get('/', function(req, res){
    res.render('landing');
});

// ================================== ENCRYPTION =======================================


router.get('/encipher', function(req, res){
    res.render('encrypt/index');
});

router.post('/encipher', function(req, res){
    var n = Number(req.body.rounds);
    console.log(n+" "+typeof(n));
    var key = req.body.key;
    var plaintext = initBlowfish.ascii2hex(req.body.ptxt);
    var algo = req.body.algo;
    var mode = req.body.mode;

    var subkeys;
    var ciphertext;
    var roundCipher = [];

    if(algo==='des'){
        initDES.padding = 0;
        subkeys = kgDES.generateSubKeys(encryptDES.hex2bin(key),'32',n);
        ciphertext = encryptDES.encipher(plaintext, key, n, mode, roundCipher);
        for(var i=0; i<subkeys.length; i++){
            subkeys[i] = initBlowfish.bin2hex(subkeys[i]);
        }
    }
    else{
        initBlowfish.padding = 0;
        subkeys = kgBlowfish.generateSubkeys(key);
        ciphertext = encryptBlowfish.encipher(plaintext, key, n, mode, roundCipher);
        // ciphertext = encryptBlowfish.encipher(plaintext, key, mode, roundCipher);
    }

    plaintext = initBlowfish.hex2ascii(plaintext);

    var obj = {
        algo: algo,
        plaintext: plaintext,
        ciphertext: ciphertext,
        subkeys: subkeys
    }

    res.render('encrypt/show', {obj: obj});

}); 

// ================================== DECRYPTION =======================================

router.get('/decipher', function(req, res){
    res.render('decrypt/index');
});

router.post('/decipher', function(req, res){
    var n = Number(req.body.rounds);
    var key = req.body.key;
    var ciphertext = req.body.ctxt;
    var algo = req.body.algo;
    var mode = req.body.mode;

    var subkeys;
    var plaintext;

    if(algo==='des'){
        subkeys = kgDES.generateSubKeys(encryptDES.hex2bin(key),'32',n);
        subkeys.reverse();
        plaintext = encryptDES.decipher(ciphertext, key, n, mode);
        for(var i=0; i<subkeys.length; i++){
            subkeys[i] = initBlowfish.bin2hex(subkeys[i]);
        }
    }
    else{
        subkeys = kgBlowfish.generateSubkeys(key);
        plaintext = encryptBlowfish.decipher(ciphertext, key, n, mode);
        // plaintext = encryptBlowfish.decipher(ciphertext, key, mode);

    }
    console.log("Plaintext : "+plaintext);
    plaintext = initBlowfish.hex2ascii(plaintext);

    var obj = {
        algo: algo,
        plaintext: plaintext,
        ciphertext: ciphertext,
        subkeys: subkeys
    }

    res.render('decrypt/show', {obj: obj});

});

// ================================== COMPARE =======================================

router.get('/compare/keys', function(req, res){
    res.render('compare/index', {mode: 'key'});
});

router.get('/compare/plaintexts', function(req, res){
    res.render('compare/index', {mode: 'plaintext'});
}); 

router.post('/compare/keys', function(req, res){
    var n = req.body.rounds;
    var key1 = req.body.key1;
    var key2 = req.body.key2;
    var plaintext = req.body.ptxt;
    var algo = req.body.algo;
    var mode = 'cbc';

    var roundCipher1 = [];
    var roundCipher2 = [];

    var subkeys1;
    var subkeys2;
    var ciphertext1;
    var ciphertext2;

    if(algo==='des'){

        initDES.padding = 0;

        subkeys1 = kgDES.generateSubKeys(encryptDES.hex2bin(key1),'32',n);
        subkeys2 = kgDES.generateSubKeys(encryptDES.hex2bin(key2),'32',n);

        ciphertext1 = encryptDES.encipher(plaintext, key1, n, mode, roundCipher1);
        ciphertext2 = encryptDES.encipher(plaintext, key2, n, mode, roundCipher2);

        for(var i=0; i<subkeys1.length; i++){
            subkeys1[i] = initBlowfish.bin2hex(subkeys1[i]);
        }

        for(var i=0; i<subkeys2.length; i++){
            subkeys2[i] = initBlowfish.bin2hex(subkeys2[i]);
        }

        var delta = [];

        for(var i=0; i<=n; i++){

            var xr = encryptDES.XOR(roundCipher1[i], roundCipher2[i]);
            roundCipher1[i] = encryptDES.bin2hex(roundCipher1[i]);
            roundCipher2[i] = encryptDES.bin2hex(roundCipher2[i]);
            
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
    }
    else{   

        initBlowfish.padding = 0;
        subkeys1 = kgBlowfish.generateSubkeys(key1);
        subkeys2 = kgBlowfish.generateSubkeys(key2);
        ciphertext1 = encryptBlowfish.encipher(plaintext, key1, n, mode, roundCipher1);
        ciphertext2 = encryptBlowfish.encipher(plaintext, key2, n, mode, roundCipher2);

        var delta = [];

        for(var i=0; i<=n; i++){

            var xr = encryptBlowfish.xor(roundCipher1[i], roundCipher2[i]);
            roundCipher1[i] = initBlowfish.bin2hex(roundCipher1[i]);
            roundCipher2[i] = initBlowfish.bin2hex(roundCipher2[i]);
            
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
    }

    var obj = {
        key1: key1,
        key2: key2,
        ptxt: plaintext,
        ctxt1: ciphertext1,
        ctxt2: ciphertext2,
        round1: roundCipher1,
        round2: roundCipher2,
        delta: delta
    };

    res.render('compare/show', {des: obj});

});

router.post('/compare/plaintexts', function(req, res){
    var n = req.body.rounds;
    var key = req.body.key;
    
    var plaintext1 = req.body.ptxt1;
    var plaintext2 = req.body.ptxt2;

    var algo = req.body.algo;
    var mode = 'cbc';

    var roundCipher1 = [];
    var roundCipher2 = [];

    var subkeys;

    var ciphertext1;
    var ciphertext2;

    if(algo==='des'){

        initDES.padding = 0;

        subkeys = kgDES.generateSubKeys(encryptDES.hex2bin(key),'32',n);

        ciphertext1 = encryptDES.encipher(plaintext1, key, n, mode, roundCipher1);
        ciphertext2 = encryptDES.encipher(plaintext2, key, n, mode, roundCipher2);

        for(var i=0; i<subkeys.length; i++){
            subkeys[i] = initBlowfish.bin2hex(subkeys[i]);
        }

        var delta = [];

        for(var i=0; i<=n; i++){

            var xr = encryptDES.XOR(roundCipher1[i], roundCipher2[i]);
            roundCipher1[i] = encryptDES.bin2hex(roundCipher1[i]);
            roundCipher2[i] = encryptDES.bin2hex(roundCipher2[i]);
            
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
    }
    else{   

        initBlowfish.padding = 0;
        subkeys = kgBlowfish.generateSubkeys(key);
        
        ciphertext1 = encryptBlowfish.encipher(plaintext1, key, n, mode, roundCipher1);
        ciphertext2 = encryptBlowfish.encipher(plaintext2, key, n, mode, roundCipher2);

        var delta = [];

        for(var i=0; i<=n; i++){

            var xr = encryptBlowfish.xor(roundCipher1[i], roundCipher2[i]);
            roundCipher1[i] = initBlowfish.bin2hex(roundCipher1[i]);
            roundCipher2[i] = initBlowfish.bin2hex(roundCipher2[i]);
            
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
    }

    var obj = {
        key: key,
        ptxt1: plaintext1,
        ptxt2: plaintext2,
        ctxt1: ciphertext1,
        ctxt2: ciphertext2,
        round1: roundCipher1,
        round2: roundCipher2,
        delta: delta
    };

    res.render('compare/show', {des: obj});

});

module.exports = router;