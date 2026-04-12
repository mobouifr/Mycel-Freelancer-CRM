const { match } = require('path-to-regexp');
const m1 = match('/clients/:id');
const m2 = match('/clients/:id/projects');
console.log("m1 matches /clients/1:", m1('/clients/1'));
console.log("m1 matches /clients/1/projects:", m1('/clients/1/projects'));
