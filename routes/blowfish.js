var express = require('express');
var router = express.Router();

var encrypt = require('../blowfish/encrypt');
var init = require('../blowfish/init');
var kg = require('../blowfish/keyGeneration');

//==========================================LANDING===============================================================

router.get('/blowfish', function(req, res){
    res.render('blowfish/landing');
});

//==========================================ENCRYPTION===============================================================

router.get('/blowfish/encipher', function(req, res){
    res.render('blowfish/encrypt/index');
});

router.post('/blowfish/encipher', function(req, res){
    var n = req.body.blowfish.rounds;
    var key = req.body.blowfish.key;
    var plaintext = req.body.blowfish.ptxt;
    var mode = req.body.blowfish.mode;

    var subkeys = kg.generateSubkeys(key);
    var ciphertext = encrypt.encipher(plaintext, key, mode);

    var obj = {
        key: key,
        subkeys: subkeys,
        plaintext: plaintext,
        ciphertext: ciphertext
    };
    console.log('===============BLOWFISH=============');
    console.log("Key: "+key);
    console.log("Plaintext: "+plaintext);
    console.log("Ciphertext: "+ciphertext);
    console.log('====================================');
    res.render('blowfish/encrypt/show', {blowfish: obj});
});

//==========================================DECRYPTION===============================================================

router.get('/blowfish/decipher', function(req, res){
    res.render('blowfish/decrypt/index');
});

router.post('/blowfish/decipher', function(req, res){
    var n = req.body.blowfish.rounds;
    var key = req.body.blowfish.key;
    var ciphertext = req.body.blowfish.ctxt;
    var mode = req.body.blowfish.mode;

    var subkeys = kg.generateSubkeys(key);
    var plaintext = encrypt.decipher(ciphertext, key, mode);

    var obj = {
        key: key,
        subkeys: subkeys,
        plaintext: plaintext,
        ciphertext: ciphertext
    };
    console.log('===============BLOWFISH=============');
    console.log("Key: "+key);
    console.log("Plaintext: "+plaintext);
    console.log("Ciphertext: "+ciphertext);
    console.log('====================================');
    res.render('blowfish/decrypt/show', {blowfish: obj});
});

module.exports = router;