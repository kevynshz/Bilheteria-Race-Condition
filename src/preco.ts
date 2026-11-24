const valorDoIngresso = (precoBase: number, taxaDeServico: number): number => {
    return precoBase + taxaDeServico;
};
const criarMultiplicador = (fator: number): ((valor: number) => number) => {
    return (valor: number): number => {
        return valor * fator;
    };
};
const aplicarTaxa = (percentual: number): ((valor: number) => number) => {
    return (valor: number): number => {
        return valor + (valor * percentual / 100);
    };
};

const aplicarDesconto = (valor: number, desconto: number): number => {
    return valor - desconto;
};
export { valorDoIngresso, criarMultiplicador, aplicarDesconto, aplicarTaxa };

const montarIngresso = (precoBase: number, pessoas: number, temDireitoAMeia: boolean): number => {
    const taxaDeServico = 5; // Valor fixo da taxa de serviço
    const precoTotal = valorDoIngresso(precoBase, taxaDeServico);

    if (temDireitoAMeia) {
        const desconto = aplicarDesconto(precoTotal, precoTotal / 2);
    }

    return precoTotal * pessoas;
};
const calcularPrecoTotal = (precoBase: number, pessoas: number, temDireitoAMeia: boolean): number => {
    const precoTotal = montarIngresso(precoBase, pessoas, temDireitoAMeia);
    return precoTotal;
};
