var init = require('./init.js');

module.exports = {
    hex2bin : function hex2bin(str){
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
        var bin = "";
        for(var i=0; i<str.length; i++){
            bin+= mp.get(str[i]);
        }
        return bin;
    },
    
    bin2hex: function bin2hex(str){
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
    },
    
    permute: function permute(str, box){
        var ans = "";
        for(var i=0; i<box.length; i++){
            ans+= str[box[i]-1];
        }
        return ans;
    },
    
    XOR: function XOR(a, b){
    
        var ans = "";
        for(var i=0; i<a.length; i++){
            if(a[i]==b[i]){ 
                ans+= "0"; 
            }else{ 
                ans+= "1"; 
            } 
        }
        return ans;
    },
    
    makeBlocks: function makeBlocks(plainText, w){
        var N = plainText.length;
        var m = Number(w);
        m*= 2;
        var ret = [];
    
        for(var i=0; i<N; i+=m){
            console.log(i);
            console.log(Math.min(i+m,N));
    
            var str = plainText.substring(i,Math.min(i+m, N));
    
            console.log(str);
            if(str.length === m){
                ret.push(str);
            }
            else{
                var diff = m-str.length;
                for(var j=0; j<diff; j++){
                    str+= "0";
                }
                ret.push(str);
                padding = diff;
            }
        }
        return ret;
    },
    
    encipher: function encipher(plainText, subkeys, w, n){
    
        var b = plainText.length;
        init.rounds = [];
        plainText = this.permute(plainText, init.IP.get(w));
       
        var leftHalf = plainText.substring(0,b/2);
        var rightHalf = plainText.substring(b/2, b);
        
        init.rounds.push(leftHalf+rightHalf);
    
        for(var j=0; j<n; j++){
    
            var expandedPT = this.permute(rightHalf, init.EP.get(w));
            var x = this.XOR(expandedPT, subkeys[j]);
    
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
            
            op = this.permute(op, init.P.get(w));
    
            x = this.XOR(op, leftHalf);
            leftHalf = x;
    
            if(j!==(n-1)){
                var t = leftHalf;
                leftHalf = rightHalf;
                rightHalf = t;
            }    
            init.rounds.push(leftHalf+rightHalf);
        }
    
        var cipher = leftHalf+rightHalf;
        cipher = this.permute(cipher, init.invIP.get(w));
        return cipher;
    }
};

