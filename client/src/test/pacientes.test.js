let request = require('supertest');
const express = require('express');

request = request('http://localhost:3000');
 
const app = express();

let id = 0;

test('Deve recuperar os pacientes', () => {
    return request.get('/pacientes')
     .expect(200)
     .then((res) => {
         expect(res.body[0]).toHaveProperty('nome');
         expect(res.body[0]).toHaveProperty('idade');         
     });
});
