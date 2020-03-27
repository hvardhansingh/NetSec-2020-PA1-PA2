var init = require('./init');

function xor(a,b){
    a = init.hex2bin(a);
    b = init.hex2bin(b);
    var ans = "";
    for(var i=0; i< a.length; i++){
        if(a[i]===b[i])
            ans+= "0";
        else
            ans+= "1";
    }
    return init.bin2hex(ans);
};

function generateSubkeys(key){
    var j = 0;
    var m = key.length;
    var subkeys = [];
    for(var i=0; i< init.P.length; i++){
        subkeys.push(xor(init.P[i], key.substr(j,8)));
        j = (j+8)%m;
    }
    return subkeys;
};

var obj = {
    xor: xor,
    generateSubkeys: generateSubkeys
};

module.exports = obj;