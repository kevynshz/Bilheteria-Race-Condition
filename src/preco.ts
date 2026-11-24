const valorDoIngresso = (precoBase: number, taxaDeServico: number): number => {
    return precoBase + taxaDeServico;
};
const criarMultiplicador = (fator: number): ((valor: number) => number) => {
    return (valor: number): number => {
        return valor * fator;
    };
};
const aplicarDesconto = (valor: number, desconto: number): number => {
    return valor - desconto;
};
export { valorDoIngresso, criarMultiplicador, aplicarDesconto };

const montarIngresso = (precoBase: number, pessoas: number, temDireitoAMeia: boolean): number => {
    const taxaDeServico = 5; // Valor fixo da taxa de serviço
    let precoTotal = valorDoIngresso(precoBase, taxaDeServico);

    if (temDireitoAMeia) {
        precoTotal = aplicarDesconto(precoTotal, precoTotal / 2);
    }

    return precoTotal * pessoas;
};