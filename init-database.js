#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados com as profissões
 * Uso: node init-database.js [URL_BASE]
 */

const https = require('https');
const http = require('http');

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🚀 Inicializando banco de dados em: ${baseUrl}`);

const url = new URL('/api/init-db', baseUrl);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const postData = JSON.stringify({});

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = client.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Banco inicializado com sucesso!');
        console.log(`📊 Resultado: ${result.message}`);
      } else {
        console.log('❌ Erro na inicialização:');
        console.log(`🔍 Detalhes: ${result.error}`);
        if (result.details) {
          console.log(`📋 Info adicional: ${result.details}`);
        }
      }
    } catch (e) {
      console.log('❌ Resposta inválida do servidor:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro na requisição: ${e.message}`);
});

req.write(postData);
req.end();