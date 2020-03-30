var btnPtxt = document.querySelector('#copy-plaintext');
var btnCtxt = document.querySelector('#copy-ciphertext');

var plaintext = document.querySelector('#plaintext');
var ciphertext = document.querySelector('#ciphertext');

btnPtxt.addEventListener('click', function(){

    var range = document.createRange();
    window.getSelection().removeAllRanges();
    range.selectNode(plaintext);
    window.getSelection().addRange(range);  
    document.execCommand('copy');
    range.setSelectionRange(0,99999);
    window.getSelection().removeAllRanges();

}); 

btnCtxt.addEventListener('click', function(){
    var range = document.createRange();
    window.getSelection().removeAllRanges();
    range.selectNode(ciphertext);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    range.setSelectionRange(0,99999);
    window.getSelection().removeAllRanges();
});