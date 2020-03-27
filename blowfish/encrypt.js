var init = require('./init'),
    keyGeneration = require('./keyGeneration');

function xor(a, b) {
    var ans = "";
    for (var i = 0; i < a.length; i++) {
        if (a[i] === b[i])
            ans += "0";
        else
            ans += "1";
    }
    return ans;
}

function makeBlocks(plainText, w) {
    var N = plainText.length;
    var m = Number(w);
    m *= 2;
    var ret = [];

    for (var i = 0; i < N; i += m) {

        var str = plainText.substring(i, Math.min(i + m, N));

        if (str.length === m) {
            ret.push(str);
        }
        else {
            var diff = m - str.length;
            for (var j = 0; j < diff; j++) {
                str += "0"; 
            }
            ret.push(str);
            init.padding = diff;
        }
    }
    return ret;
}

function F(block) {          // coded for half width = 32 

    var Xa = block.substring(0, 8);  // bin
    var Xb = block.substring(8, 16);
    var Xc = block.substring(16, 24);
    var Xd = block.substring(24, 32);

    var inp1 = parseInt(Xa, 2);    // Number
    var inp2 = parseInt(Xb, 2);
    var inp3 = parseInt(Xc, 2);
    var inp4 = parseInt(Xd, 2);

    var out1 = init.sBox[0][inp1];  // hex string
    var out2 = init.sBox[1][inp2];
    var out3 = init.sBox[2][inp3];
    var out4 = init.sBox[3][inp4];

    var mod = 4294967296;

    // parseInt(out1,16) --> Decimal Number

    var x1 = (parseInt(out1, 16) + parseInt(out2, 16)) % mod;

    x1 = (x1).toString(16); // hex string

    var s = "";
    for (var i = 0; i < (8 - (x1.length)); i++) {
        s += "0";
    }
    x1 = s + x1;

    var a1 = keyGeneration.xor(x1, out3);    // hex string

    var out = (parseInt(a1, 16) + parseInt(out4, 16)) % mod; // Decimal Number

    out = (out).toString(2);   // 32-bit bin string

    var s = "";
    for (var i = 0; i < (32 - (out.length)); i++) {
        s += "0";
    }
    out = s + out;
    // console.log(out.length);
    return out;
}

function blowfish(block, subkeys, flg) {

    var n = 16;
    var cipher = "";

    var b = block.length;
    var leftHalf = block.substring(0, b / 2);
    var rightHalf = block.substring(b / 2, b);

    if(flg===true){
        subkeys.reverse();
    }

    for (var j = 0; j < n; j++) {
        leftHalf = xor(subkeys[j], leftHalf);

        var f = F(leftHalf);
        rightHalf = xor(rightHalf, f);

        var l = leftHalf;
        leftHalf = rightHalf;
        rightHalf = l;
    }

    var lh = leftHalf;
    leftHalf = rightHalf;
    rightHalf = lh;

    rightHalf = xor(rightHalf, subkeys[16]);
    leftHalf = xor(leftHalf, subkeys[17]);

    cipher += leftHalf;
    cipher += rightHalf;
    
    return cipher;
}

function cbcEncryption(plaintext, key){

    plaintext = init.hex2bin(plaintext);
    blocks = makeBlocks(plaintext, 32); 

    subkeys = keyGeneration.generateSubkeys(key);

    for (var i = 0; i < subkeys.length; i++) {
        subkeys[i] = init.hex2bin(subkeys[i]);
    }

    var IV = init.hex2bin(init.IV); 
    
    var prev = "";
    var cipher = "";

    blocks.forEach(function(block){
        if(prev.length>0){
            block = xor(block, prev);
        }
        else{
            block = xor(block, IV);
        }

        prev = blowfish(block, subkeys, false);
        cipher+= init.bin2hex(prev);
    });

    return cipher;
}

function cbcDecryption(ciphertext, key){

    ciphertext = init.hex2bin(ciphertext);
    blocks = makeBlocks(ciphertext, 32); 

    subkeys = keyGeneration.generateSubkeys(key);

    for (var i = 0; i < subkeys.length; i++) {
        subkeys[i] = init.hex2bin(subkeys[i]);
    }

    var IV = init.hex2bin(init.IV); 
    
    var prev = "";
    var ptxt = "";

    blocks.forEach(function(block){

        var res = blowfish(block, subkeys, true);
        if(prev.length>0){
            res = xor(res, prev);
        }
        else{
            res = xor(res, IV);
        }
        prev = block;
        ptxt+= init.bin2hex(res);
    });

    return ptxt;
}

function encipher(plaintext, key, mode){

    if(mode==='cbc'){
        return cbcEncryption(plaintext, key);
    }
    else if(mode==='ofb'){

    }
}

function decipher(ciphertext, key, mode){
    // return encrypt(ciphertext, key, true);
    if(mode==='cbc'){
        return cbcDecryption(ciphertext, key);
    }
    else if(mode==='ofb'){

    }
}

var obj = {
    encipher: encipher,
    decipher: decipher
};  

module.exports = obj;
