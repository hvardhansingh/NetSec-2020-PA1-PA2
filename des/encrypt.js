var init = require('./init.js');
var kg = require('./keyGeneration');

var w = '32';

function hex2bin(str){
    let mp = new Map();
    mp.set('0', '0000');
    mp.set('1', '0001');
    mp.set('2', '0010');
    mp.set('3', '0011');
    mp.set('4', '0100');
    mp.set('5', '0101');
    mp.set('6', '0110');
    mp.set('7', '0111');
    mp.set('8', '1000');
    mp.set('9', '1001');
    mp.set('A', '1010');
    mp.set('B', '1011');
    mp.set('C', '1100');
    mp.set('D', '1101');
    mp.set('E', '1110');
    mp.set('F', '1111');
    mp.set('a', '1010');
    mp.set('b', '1011');
    mp.set('c', '1100');
    mp.set('d', '1101');
    mp.set('e', '1110');
    mp.set('f', '1111');
    var bin = "";
    for(var i=0; i<str.length; i++){
        bin+= mp.get(str[i]);
    }
    return bin;
}

function bin2hex(str){
    let mp = new Map();
    mp.set('0000', '0');
    mp.set('0001', '1');
    mp.set('0010', '2');
    mp.set('0011', '3');
    mp.set('0100', '4');
    mp.set('0101', '5');
    mp.set('0110', '6');
    mp.set('0111', '7');
    mp.set('1000', '8');
    mp.set('1001', '9');
    mp.set('1010', 'A');
    mp.set('1011', 'B');
    mp.set('1100', 'C');
    mp.set('1101', 'D');
    mp.set('1110', 'E');
    mp.set('1111', 'F');
    var hex = "";
    for(var i=0; i<str.length; i+=4){
        var tmp = "";
        tmp+= str[i];
        tmp+= str[i+1];
        tmp+= str[i+2];
        tmp+= str[i+3];
        hex+= mp.get(tmp);
    }
    return hex;
}

function permute(str, box){
    var ans = "";
    for(var i=0; i<box.length; i++){
        ans+= str[box[i]-1];
    }
    return ans;
}

function XOR(a, b){
    
    var ans = "";
    for(var i=0; i<a.length; i++){
        if(a[i]==b[i]){ 
            ans+= "0"; 
        }else{ 
            ans+= "1"; 
        } 
    }
    return ans;
}

function makeBlocks(plainText, w){
    var N = plainText.length;
    var m = Number(w);
    m*= 2;
    var ret = [];

    for(var i=0; i<N; i+=m){

        var str = plainText.substring(i,Math.min(i+m, N));

        if(str.length === m){
            ret.push(str);
        }
        else{
            var diff = m-str.length;
            for(var j=0; j<diff; j++){
                str+= "0";
            }
            ret.push(str);
            init.padding = diff;
        }
    }
    return ret;
}

function DES(block, key, n, flg){
    
    var b = block.length;
    init.rounds = [];

    key = hex2bin(key).substring(0,64);
    var subkeys = kg.generateSubKeys(key,'32',n);

    if(flg){
        subkeys.reverse();
    }

    block = permute(block, init.IP.get(w));
   
    var leftHalf = block.substring(0,b/2);
    var rightHalf = block.substring(b/2, b);
    
    init.rounds.push(leftHalf+rightHalf);

    for(var j=0; j<n; j++){

        var expandedPT = permute(rightHalf, init.EP.get(w));
        var x = XOR(expandedPT, subkeys[j]);

        var op = "";
        for(var i=0; i<(b/8); i++){
            var row = 2*(Number(x[i*6]-'0'))+ (Number(x[i*6 +5]-'0')); 
            var col= 8*(Number(x[i*6 +1 ]-'0'))+ 4*(Number(x[i*6 +2]-'0'))+ 2*(Number(x[i*6 +3]-'0'))+ (Number(x[i*6 +4]-'0')); 

            var val = Number(init.sBoxes.get(w)[i][row][col]);
            
            op+= Math.floor((val/8)); 
            val= val%8; 
            op+= Math.floor((val/4)); 
            val= val%4; 
            op+= Math.floor((val/2));
            val= val%2; 
            op+= Math.floor((val)); 
        }
        
        op = permute(op, init.P.get(w));

        x = XOR(op, leftHalf);
        leftHalf = x;

        if(j!==(n-1)){
            var t = leftHalf;
            leftHalf = rightHalf;
            rightHalf = t;
        }    
        init.rounds.push(leftHalf+rightHalf);
    }

    var cipher = leftHalf+rightHalf;
    cipher = permute(cipher, init.invIP.get(w));
    return cipher;
}

function cbcEncryption(plaintext, key, n){
    plaintext = hex2bin(plaintext);
    var blocks = makeBlocks(plaintext, 32); 

    var IV = hex2bin(init.IV); 
    
    var prev = "";
    var cipher = "";

    blocks.forEach(function(block){
        
        if(prev.length>0){
            block = XOR(block, prev);
        }
        else{
            block = XOR(block, IV);
        }

        prev = DES(block, key, n, false);
        cipher+= bin2hex(prev);
    });
    return cipher;
}

function cbcDecryption(ciphertext,key,n){
    
    ciphertext = hex2bin(ciphertext);
    var blocks = makeBlocks(ciphertext, 32); 

    var IV = hex2bin(init.IV); 
    
    var prev = "";
    var ptxt = "";

    blocks.forEach(function(block){
    
        var res = DES(block, key, n, true);
        if(prev.length>0){
            res = XOR(res, prev);
        }
        else{
            res = XOR(res, IV);
        }
        prev = block;
        ptxt+= res;
    });

    ptxt = ptxt.substring(0, ptxt.length-init.padding);
    ptxt = bin2hex(ptxt);

    return ptxt;
}

function ofb(plaintext, key, n, flg){
    var s = 8;
    var b = 64;

    plaintext = hex2bin(plaintext);
    var blocks = makeBlocks(plaintext, 4); 
    var IV = hex2bin(init.IV); 
    var shiftReg = IV;

    var prev = "";
    var cipher = "";

    blocks.forEach(function(block){
        var res = "";
        if(prev.length>0){
            shiftReg = shiftReg.substring(s,b)+prev;
            
        }
        res = DES(shiftReg, key, n, false);
        prev = res.substring(0,s);
        cipher+= XOR(prev, block);
    });

    if(flg){
        cipher = cipher.substring(0, cipher.length-init.padding);
    }

    cipher = bin2hex(cipher);
    return cipher;
}

function encipher(plaintext, key, n, mode){
    if(mode==='cbc'){
        return cbcEncryption(plaintext,key,n);
    }
    else{
        return ofb(plaintext,key,n,false);
    }
}

function decipher(ciphertext, key, n, mode){
    if(mode==='cbc'){
        return cbcDecryption(ciphertext,key,n);
    }
    else{
        return ofb(ciphertext,key,n,true)
    }
}

var obj = {
    encipher: encipher,
    decipher: decipher,
    bin2hex: bin2hex,
    hex2bin: hex2bin
}; 

module.exports = obj;

