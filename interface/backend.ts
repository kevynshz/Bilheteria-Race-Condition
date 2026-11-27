import { Evento } from '../src/dominio.ts';
import { criarBilheteria } from '../src/bilheteria.ts';
import { criarPagamentoFalso } from '../src/pagamento.ts';
import { criarServidor } from '../src/servidor.ts';

// Adaptação exclusiva da interface. As regras e as validações continuam
// sendo executadas pela classe Evento original, sem alterar seu encapsulamento.
class EventoComMapa extends Evento {
    #indisponiveis = new Set<number>();

    override reservar(poltronas: number[]): void {
        super.reservar(poltronas);

        for (const poltrona of poltronas) {
            this.#indisponiveis.add(poltrona);
        }
    }

    override liberar(poltronas: number[]): void {
        super.liberar(poltronas);

        for (const poltrona of poltronas) {
            this.#indisponiveis.delete(poltrona);
        }
    }

    mapa() {
        return {
            ...this.info(),
            indisponiveis: [...this.#indisponiveis].sort((a, b) => a - b)
        };
    }
}

// Mesmos IDs, preços, capacidades e condições de pagamento do main.ts.
const eventos = [
    new EventoComMapa(1, 'Show de abertura', 100, 100),
    new EventoComMapa(2, 'Festival de música', 80, 150),
    new EventoComMapa(3, 'Espetáculo de teatro', 60, 50)
];

const pagar = criarPagamentoFalso({
    latenciaMs: 80,
    taxaDeFalha: 0.1
});

const bilheteria = criarBilheteria({
    eventos,
    pagar,
    limitePagamentoMs: 500
});

const app = criarServidor(bilheteria);

// Inclui reservas em andamento: elas também bloqueiam a venda de um assento.
// O rollback passa por liberar() e devolve o lugar ao mapa automaticamente.
app.get('/mapa', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(eventos.map(evento => evento.mapa()));
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Backend com mapa: http://127.0.0.1:3000');
});
