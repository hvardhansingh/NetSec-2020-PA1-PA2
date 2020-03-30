var init = require('./init.js');

module.exports = {
    rotateSubKey: function rotateSubKey(subkey, m){
        return subkey.substring(m, subkey.length) + subkey.substring(0, m);
    },
    
    permute: function permute(str, box){
        var ans = "";
        for(var i=0; i<box.length; i++){
            ans+= str[box[i]-1];
        }
        return ans;
    },
    
    generateSubKeys: function generateSubKeys(key, w, n){
    
        var b = key.length-key.length/8;
        
        key = this.permute(key,init.pc1.get(w));

        var leftSubkey = key.substring(0,b/2);
        var rightSubkey = key.substring(b/2,b);
    
        var subKeys = [];
    
        for(var i=0; i<n; i++){
            leftSubkey = this.rotateSubKey(leftSubkey, init.leftShift[i]);
            rightSubkey = this.rotateSubKey(rightSubkey, init.leftShift[i]);
    
            var key = this.permute(leftSubkey+rightSubkey, init.pc2.get(w));
            subKeys.push(key);
        }
        return subKeys;
    }
};