import type { EventoInfo } from "./tipos.js";

export abstract class ErroDeNegocio extends Error {
    public readonly status: number;

    constructor(mensagem: string, status: number) {
        super(mensagem);
        this.status = status;
        this.name = this.constructor.name;
    }
}

export class DadosInvalidosErro extends ErroDeNegocio {
    constructor(mensagem: string) {
        super(mensagem, 400);
    }
}

export class NaoEncontradoErro extends ErroDeNegocio {
    constructor(mensagem: string) {
        super(mensagem, 404);
    }
}

export class PoltronaOcupadaErro extends ErroDeNegocio {
    constructor(mensagem: string) {
        super(mensagem, 409);
    }
}

export class PagamentoErro extends ErroDeNegocio {
    constructor(mensagem: string) {
        super(mensagem, 502);
    }
}


export class Evento {
    #poltronasVendidas: number[] = [];

    constructor(
        public readonly id: number,
        public readonly nome: string,
        public readonly preco: number,
        public readonly capacidade: number
    ) {}

    get disponivel(): number {
        return this.capacidade - this.#poltronasVendidas.length;
    }

    reservar(poltronas: number[]): void {
        if (poltronas.length === 0) {
            throw new DadosInvalidosErro("Nenhuma poltrona informada.");
        }

        if (poltronas.some(poltrona =>
            !Number.isInteger(poltrona) ||
            poltrona < 1 ||
            poltrona > this.capacidade
        )) {
            throw new DadosInvalidosErro("Poltrona inválida.");
        }

        if (new Set(poltronas).size !== poltronas.length) {
            throw new DadosInvalidosErro("Existem poltronas repetidas.");
        }

        if (poltronas.some(poltrona =>
            this.#poltronasVendidas.includes(poltrona)
        )) {
            throw new PoltronaOcupadaErro("Poltrona já ocupada.");
        }

        this.#poltronasVendidas.push(...poltronas);
    }

    liberar(poltronas: number[]): void {
        if (poltronas.some(poltrona =>
            !this.#poltronasVendidas.includes(poltrona)
        )) {
            throw new DadosInvalidosErro("Poltrona não estava reservada.");
        }

        this.#poltronasVendidas = this.#poltronasVendidas.filter(
            poltrona => !poltronas.includes(poltrona)
        );
    }

    info(): EventoInfo {
        return {
            id: this.id,
            nome: this.nome,
            preco: this.preco,
            capacidade: this.capacidade,
            disponivel: this.disponivel
        };
    }
}
