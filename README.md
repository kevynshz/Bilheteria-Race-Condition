
# Bilheteria concorrente

Projeto final de Paradigmas de Linguagens de Programação. Enunciado completo no Blackboard.

Os arquivos de `src/` que vocês escrevem já existem, vazios; o `tipos.ts` e o `servidor.ts` vêm prontos. O que vai em cada um está no passo indicado do enunciado:

| Arquivo | Passo do enunciado |
| :--- | :--- |
| `src/tipos.ts` (pronto) | 1: os tipos |
| `src/regras.ts` | 2: meia-entrada |
| `src/preco.ts` | 3: preço (funcional) |
| `src/dominio.ts` | 4: evento e erros (orientado a objetos) |
| `src/bilheteria.ts` | 5: a venda, onde a concorrência aparece |
| `src/servidor.ts` (pronto) e `src/main.ts` | 6: ligar o servidor |

Não alterem `src/pagamento.ts`, `src/servidor.ts`, `src/bench.ts` nem `testes/`: a correção usa os originais.

Para começar, sigam o `GUIA.md`. Depois dele, os comandos são:

```bash
npm install
npm test          # correção automática: mostra os pontos
npm start         # serviço em http://localhost:3000
npm run bench     # com o serviço no ar: 200 pedidos simultâneos no evento 1, dois por poltrona
```

Exemplo de pedido:

```bash
curl -X POST localhost:3000/reservas -H 'Content-Type: application/json' \
  -d '{"eventoId":1,"ingressos":[{"nome":"Ana","idade":20,"estudante":true,"pcd":false,"poltrona":7}]}'
```

---

## Preencham (avaliado no vídeo)

**Link do vídeo:**

### Integrantes

| Nome | Usuário do GitHub | Parte principal |
| :--- | :--- | :--- |
| Gabriel | | Orientação a objetos e documentação |
| Kevyn | kevynshz | Programação funcional e integração |
| Patrick | | Programação concorrente |

### Decisões

1. **Concorrência.** Como vocês garantem que duas pessoas não ficam com a mesma poltrona? Onde estava o
   `await` perigoso?

2. **OO.** O que o `Evento` esconde e por quê? Por que o `reservar` é tudo ou nada? Por que os erros são uma hierarquia de classes?

   **Resposta:** A classe `Evento` utiliza o encapsulamento para proteger a lista de poltronas vendidas por meio do atributo privado `#poltronasVendidas`. Dessa forma, o estado interno do evento não pode ser modificado diretamente por outras partes do sistema. As alterações são realizadas pelos métodos `reservar` e `liberar`, que garantem o cumprimento das regras de negócio. O getter `disponivel` permite consultar a quantidade de poltronas livres sem permitir sua alteração direta.

   O método `reservar` funciona no modelo tudo ou nada, pois valida todas as poltronas solicitadas antes de modificar o estado do evento. Caso exista uma poltrona inválida, repetida ou ocupada, nenhuma poltrona do pedido será reservada.

   A hierarquia de erros utiliza a herança para centralizar o tratamento de exceções na classe abstrata `ErroDeNegocio`. Cada classe derivada possui seu próprio status HTTP, permitindo que o servidor identifique os erros de negócio e retorne respostas adequadas sem duplicar a lógica de tratamento.

3. **Funcional.** O que ganhamos com `preco.ts` puro? Como vocês testariam ele sem subir o servidor?

4. **Se fosse em outro paradigma.** Escolham uma das partes e expliquem como ficaria em outro paradigma, e se ficaria melhor ou pior.

   **Resposta:** A classe `Evento`, implementada utilizando programação orientada a objetos, também poderia ser desenvolvida utilizando o paradigma funcional.

   Nesse cenário, o estado do evento seria representado por uma estrutura de dados imutável. As operações de reserva e liberação seriam funções que receberiam o estado atual e retornariam um novo estado, sem modificar o original.

   Essa abordagem facilitaria os testes e reduziria efeitos colaterais. Entretanto, seria necessário gerenciar e substituir explicitamente o estado do evento a cada operação.

   Para este projeto, a orientação a objetos é uma escolha adequada, pois permite encapsular o estado das poltronas e reunir os comportamentos e as regras de negócio em uma única classe. Isso facilita a organização, a manutenção e a proteção dos dados.

5. **Concorrente × paralelo.** O Node roda o JavaScript numa linha só: os pedidos de vocês são concorrentes, não paralelos. O que mudaria se a venda rodasse em vários núcleos ao mesmo tempo?

### Resultados do bench

| Cenário | Pedidos | Tempo (ms) | Vendidos | Poltrona ocupada | Falha de pagamento |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Padrão (`main.ts`) | 200 | 863 | 99 | 89 | 12 |

O bench ocupa as poltronas do evento 1: para rodar de novo, parem o `npm start` (Ctrl+C) e subam outra vez.

O que os números mostram:

Na execução local com as branches de preço, domínio e concorrência integradas, 99 das 100 poltronas do evento 1
foram vendidas. Os 89 retornos HTTP 409 indicam que a poltrona pedida já estava ocupada ou reservada no momento
da tentativa. Os 12 retornos HTTP 502 indicam falhas do pagamento simulado, que devolvem a poltrona para a venda.
Como as falhas são aleatórias, as contagens e o tempo podem variar a cada execução.
