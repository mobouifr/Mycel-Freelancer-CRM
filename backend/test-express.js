const express = require('express');
const app = express();

app.get('/clients/:id', (req, res) => res.send(`Hit :id with ${req.params.id}`));
app.get('/clients/:id/projects', (req, res) => res.send(`Hit :id/projects with ${req.params.id}`));

app.listen(4010, () => console.log('Listening on 4010...'));
