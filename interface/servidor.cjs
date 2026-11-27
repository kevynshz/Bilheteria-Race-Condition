const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const API = 'http://127.0.0.1:3000';

const PORTA = 4173;

const pagina = fs.readFileSync(path.join(__dirname, 'index.html'));

function json(res, status, mensagem) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify({
        mensagem
    }));
}

const server = http.createServer(async (req, res) => {
    const rota = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && rota === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        });
        return res.end(pagina);
    }
    if (req.method === 'GET' && ['/assets/lana.webp', '/assets/adele.webp', '/assets/taylor.webp'].includes(rota)) {
        const arte = fs.readFileSync(path.join(__dirname, 'assets', path.basename(rota)));
        res.writeHead(200, {
            'Content-Type': 'image/webp',
            'Cache-Control': 'no-store'
        });
        return res.end(arte);
    }
    const permitido = (req.method === 'GET' && ['/eventos', '/mapa'].includes(rota)) || (req.method === 'POST' && rota === '/reservas');
    if (!permitido) {
        return json(res, 404, 'Rota não encontrada.');
    }
    try {
        const partes = [];
        let tamanho = 0;
        if (req.method === 'POST') {
            for await (const parte of req) {
                tamanho += parte.length;
                if (tamanho > 65536) {
                    return json(res, 413, 'Pedido grande demais.');
                }
                partes.push(parte);
            }
        }
        const resposta = await fetch(API + rota, {
            method: req.method,
            ...(req.method === 'POST' ? {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: Buffer.concat(partes)
            } : {}),
            signal: AbortSignal.timeout(10000)
        });
        const corpo = Buffer.from(await resposta.arrayBuffer());
        res.writeHead(resposta.status, {
            'Content-Type': resposta.headers.get('content-type') || 'application/json',
            'Cache-Control': 'no-store'
        });
        res.end(corpo);
    } catch (erro) {
        json(res, 503, 'API indisponível. Confira se npm start está rodando na porta 3000.');
    }
});
server.listen(PORTA, '127.0.0.1', () => console.log('Interface: http://127.0.0.1:' + PORTA + ' | API: ' + API));
