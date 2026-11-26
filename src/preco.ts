import type { Ingresso, Pessoa, TipoIngresso } from "./tipos.ts";

export const valorDoIngresso = (precoBase: number): ((tipo: TipoIngresso) => number) => {
    return (tipo) => {
        if (tipo === "inteira") {
            return precoBase;
        }

        const meia = precoBase / 2;
        return Math.round(meia * 100) / 100;
    };
};

export const aplicarTaxa = (percentual: number): ((valor: number) => number) => {
    return (valor) => {
        const valorComTaxa = valor * (1 + percentual);
        return Math.round(valorComTaxa * 100) / 100;
    };
};

export const montarIngressos = (
    precoBase: number,
    pessoas: readonly Pessoa[],
    temDireitoAMeia: (pessoa: Pessoa) => boolean,
): Ingresso[] => {
    const calcularValor = valorDoIngresso(precoBase);

    return pessoas.map((pessoa) => {
        const tipo = temDireitoAMeia(pessoa) ? "meia" : "inteira";

        return {
            nome: pessoa.nome,
            poltrona: pessoa.poltrona,
            tipo,
            valor: calcularValor(tipo),
        };
    });
};

export const calcularTotal = (ingressos: readonly Ingresso[]): number => {
    const subtotal = ingressos.reduce((soma, ingresso) => soma + ingresso.valor, 0);
    return aplicarTaxa(0.1)(subtotal);
};
