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
    var n = req.body.rounds;
    var key = req.body.key;
    var plaintext = initBlowfish.ascii2hex(req.body.ptxt);
    var algo = req.body.algo;
    var mode = req.body.mode;

    var subkeys;
    var ciphertext;

    if(algo==='des'){
        initDES.padding = 0;
        subkeys = kgDES.generateSubKeys(encryptDES.hex2bin(key),'32',n);
        ciphertext = encryptDES.encipher(plaintext, key, n, mode);
        for(var i=0; i<subkeys.length; i++){
            subkeys[i] = initBlowfish.bin2hex(subkeys[i]);
        }
    }
    else{
        initBlowfish.padding = 0;
        subkeys = kgBlowfish.generateSubkeys(key);
        ciphertext = encryptBlowfish.encipher(plaintext, key, mode);
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
    var n = req.body.rounds;
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
        plaintext = encryptBlowfish.decipher(ciphertext, key, mode);
    }

    plaintext = initBlowfish.hex2ascii(plaintext);

    var obj = {
        algo: algo,
        plaintext: plaintext,
        ciphertext: ciphertext,
        subkeys: subkeys
    }

    res.render('decrypt/show', {obj: obj});

});

module.exports = router;