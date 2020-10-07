const path = require('path');
const express = require('express');

const app = express();
app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res, next) => {
    const indexFilePath = path.join(__dirname, '/public/index.html');
    res.sendFile(indexFilePath);
});

app.listen(4000, console.log('Server listening at port 4000'));

