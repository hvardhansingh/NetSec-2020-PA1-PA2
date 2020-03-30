var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
    
var desRoutes       = require('./routes/des'),
    blowfishRoutes  = require('./routes/blowfish'),
    indexRoutes     = require('./routes/index');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(desRoutes);
app.use(blowfishRoutes);
app.use(indexRoutes);

app.listen(3000, function(){
    console.log('Serving at port 3000 !');
});
// app.listen(process.env.PORT,process.env.IP);