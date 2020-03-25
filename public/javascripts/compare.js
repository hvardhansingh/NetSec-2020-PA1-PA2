var diffKey = document.querySelector('#diffKey');
var diffPtxt = document.querySelector('#diffPtxt');
var key = document.querySelector('#key');
var ptxt = document.querySelector('#ptxt');

diffKey.addEventListener('click', function(){
    ptxt.style.display = 'none';
    key.style.display = 'block';
    diffPtxt.classList.remove('active');
    diffKey.classList.add('active');
});

diffPtxt.addEventListener('click', function(){
    key.style.display = 'none';
    ptxt.style.display = 'block';
    diffKey.classList.remove('active');
    diffPtxt.classList.add('active');
});