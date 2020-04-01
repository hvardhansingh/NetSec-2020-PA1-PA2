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

function blowfish(block, key, n, flg, roundCipher) {

    var cipher = "";
    var b = block.length;
    var leftHalf = block.substring(0, b / 2);
    var rightHalf = block.substring(b / 2, b);

    if(flg===false){
        roundCipher.push(leftHalf+rightHalf);
    }

    var subkeys = keyGeneration.generateSubkeys(key);
    subkeys = subkeys.slice(0,n+2);

    for (var i = 0; i < subkeys.length; i++) {
        subkeys[i] = init.hex2bin(subkeys[i]);
    }

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

        if(flg===false){
            roundCipher.push(leftHalf+rightHalf);
        }
    }

    var lh = leftHalf;
    leftHalf = rightHalf;
    rightHalf = lh;

    rightHalf = xor(rightHalf, subkeys[Number(n)]);
    leftHalf = xor(leftHalf, subkeys[Number(n)+1]);

    cipher += leftHalf;
    cipher += rightHalf;
    
    return cipher;
}

function cbcEncryption(plaintext, key, n, roundCipher){

    plaintext = init.hex2bin(plaintext);
    var blocks = makeBlocks(plaintext, 32); 

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

        prev = blowfish(block, key, n, false, roundCipher);
        cipher+= init.bin2hex(prev);
    });

    return cipher;
}

function cbcDecryption(ciphertext, key, n){

    ciphertext = init.hex2bin(ciphertext);
    var blocks = makeBlocks(ciphertext, 32); 

    var IV = init.hex2bin(init.IV); 
    
    var prev = "";
    var ptxt = "";

    blocks.forEach(function(block){
    
        var res = blowfish(block, key, n, true);
        if(prev.length>0){
            res = xor(res, prev);
        }
        else{
            res = xor(res, IV);
        }
        prev = block;
        ptxt+= res;
    });

    ptxt = ptxt.substring(0, ptxt.length-init.padding);
    ptxt = init.bin2hex(ptxt);

    return ptxt;
}

function ofb(plaintext, key, n, flg, roundCipher){

    var s = 8;
    var b = 64;

    plaintext = init.hex2bin(plaintext);
    var blocks = makeBlocks(plaintext, 4); 
    
    var IV = init.hex2bin(init.IV); 
    var shiftReg = IV;

    var prev = "";
    var cipher = "";

    blocks.forEach(function(block){
        var res = "";
        if(prev.length>0){
            shiftReg = shiftReg.substring(s,b)+prev;
            
        }
        res = blowfish(shiftReg,key,n,false, roundCipher);
        prev = res.substring(0,s);
        cipher+= xor(prev, block);
    });

    if(flg){
        console.log("padding : "+init.padding);
        cipher = cipher.substring(0, cipher.length-init.padding);
    }

    cipher = init.bin2hex(cipher);

    return cipher;
}

// function ofb(plaintext, key, n, flg, roundCipher){
//     var s = 8;
//     var b = 64;

//     plaintext = init.hex2bin(plaintext);
//     var blocks = makeBlocks(plaintext, 4); 
//     var IV = init.hex2bin(init.IV); 
//     var shiftReg = IV;

//     var prev = "";
//     var cipher = "";

//     blocks.forEach(function(block){
//         var res = "";
//         if(prev.length>0){
//             shiftReg = shiftReg.substring(s,b)+prev;
            
//         }
//         // res = blowfish(shiftReg,key,n, false, roundCipher);
//         res = blowfish(shiftReg,key,n, flg, roundCipher);
//         prev = res.substring(0,s);
//         cipher+= init.bin2hex(xor(prev, block));
//     });
//     return cipher;
// }

function encipher(plaintext, key, n, mode, roundCipher){

    if(mode==='cbc'){
        return cbcEncryption(plaintext, key, n, roundCipher);
    }
    else if(mode==='ofb'){
        return ofb(plaintext, key, n, false, roundCipher);
    }
}

function decipher(ciphertext, key, n, mode){
    if(mode==='cbc'){
        return cbcDecryption(ciphertext, key, n);
    }
    else if(mode==='ofb'){
        var roundCipher = [];
        return ofb(ciphertext, key, n, true, roundCipher);
    }
}

var obj = {
    xor: xor,
    encipher: encipher,
    decipher: decipher
};  

module.exports = obj;
