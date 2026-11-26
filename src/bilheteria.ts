
import type {
  ConfigBilheteria,
  EventoInfo,
  Pedido,
  Comprovante
} from "./tipos.ts";

import {
  DadosInvalidosErro,
  NaoEncontradoErro,
  PagamentoErro
} from "./dominio.ts";

import { direitoAMeia } from "./regras.ts";
import { montarIngressos, calcularTotal } from "./preco.ts";

// Define um tempo máximo de espera para o pagamento.
function comTempoLimite<T>(
  promessa: Promise<T>,
  ms: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const limite = new Promise<never>((_, rejeitar) => {
    timer = setTimeout(
      () => rejeitar(new Error("Tempo esgotado")),
      ms
    );
  });

  return Promise.race([promessa, limite])
    .finally(() => clearTimeout(timer));
}

export class Bilheteria {
  #eventos: ConfigBilheteria["eventos"];
  #pagar: ConfigBilheteria["pagar"];
  #limitePagamentoMs: number;
  #contadorReservas = 0;

  constructor(config: ConfigBilheteria) {
    this.#eventos = config.eventos;
    this.#pagar = config.pagar;
    this.#limitePagamentoMs = config.limitePagamentoMs;
  }

  // Retorna as informações dos eventos cadastrados.
  listarEventos(): EventoInfo[] {
    return this.#eventos.map((evento) => evento.info());
  }

  // Realiza o processo completo de venda.
  async reservar(pedido: Pedido): Promise<Comprovante> {

    // 1. Valida o pedido.
    if (
      !pedido ||
      !Array.isArray(pedido.ingressos) ||
      pedido.ingressos.length === 0
    ) {
      throw new DadosInvalidosErro("Pedido sem ingressos");
    }

    // 2. Localiza o evento solicitado.
    const evento = this.#eventos.find(
      (evento) => evento.id === pedido.eventoId
    );

    if (!evento) {
      throw new NaoEncontradoErro("Evento não encontrado");
    }

    // 3. Extrai as poltronas solicitadas.
    const poltronas = pedido.ingressos.map(
      (pessoa) => pessoa.poltrona
    );

    // 4. Reserva as poltronas antes do pagamento.
    // Isso impede que pedidos concorrentes reservem
    // as mesmas poltronas durante o await.
    evento.reservar(poltronas);

    // 5. Monta os ingressos e calcula o valor total.
    const ingressos = montarIngressos(
      evento.preco,
      pedido.ingressos,
      direitoAMeia
    );

    const total = calcularTotal(ingressos);

    // 6. Processa o pagamento com tempo limite.
    try {
      await comTempoLimite(
        this.#pagar(total),
        this.#limitePagamentoMs
      );
    } catch {
      // Em caso de falha ou timeout, devolve as poltronas.
      evento.liberar(poltronas);

      throw new PagamentoErro(
        "Pagamento recusado ou tempo limite excedido"
      );
    }

    // 7. Gera um identificador único para a reserva.
    this.#contadorReservas += 1;

    // 8. Retorna o comprovante da compra.
    return {
      reservaId: this.#contadorReservas,
      eventoId: evento.id,
      ingressos,
      total
    };
  }
}

// Função fábrica responsável por criar a bilheteria.
export function criarBilheteria(
  config: ConfigBilheteria
): Bilheteria {
  return new Bilheteria(config);
}
