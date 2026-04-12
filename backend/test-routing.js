const { match } = require('path-to-regexp');
const m1 = match('/clients/:id');
console.log("match 123:", m1('/clients/123'));
console.log("match 123/projects:", m1('/clients/123/projects'));
