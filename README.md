# Bilheteria concorrente

Projeto final de Paradigmas de Linguagens de Programação. Enunciado completo no Blackboard.

**Link do vídeo:** A inserir.

## Estrutura do projeto

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

## Integrantes

| Nome | Usuário do GitHub | Parte principal |
| :--- | :--- | :--- |
| Gabriel | | Orientação a objetos e documentação |
| Kevyn | kevynshz | Programação funcional e integração |
| Patrick | | Programação concorrente |

## Decisões

### 1. Concorrência

**Como vocês garantem que duas pessoas não ficam com a mesma poltrona? Onde estava o `await` perigoso?**

**Resposta:** Para garantir que duas pessoas não reservem a mesma poltrona, realizamos a reserva de forma síncrona, antes de aguardar o processamento do pagamento. O método `evento.reservar()` verifica a disponibilidade das poltronas e atualiza o estado do evento antes que a execução encontre o primeiro `await`.

O `await` perigoso estaria no processamento do pagamento caso ele fosse realizado antes da reserva. Nesse cenário, dois pedidos concorrentes poderiam iniciar o pagamento para uma mesma poltrona antes que ela fosse marcada como ocupada. Isso permitiria que mais de um cliente tivesse o pagamento processado, mesmo que apenas um deles pudesse concluir a reserva.

Na implementação atual, a poltrona é reservada antes do pagamento, fazendo com que outros pedidos para a mesma poltrona recebam o erro HTTP 409 enquanto ela estiver ocupada. Como o pagamento é assíncrono, pedidos para outras poltronas podem continuar sendo processados sem precisar esperar uns pelos outros.

Também utilizamos `Promise.race()` para estabelecer um tempo limite de pagamento. Caso o pagamento seja recusado ou ultrapasse esse limite, realizamos um rollback por meio do método `evento.liberar()`, devolvendo as poltronas à disponibilidade e retornando o erro HTTP 502.

O timeout limita o tempo de espera da bilheteria, mas não cancela necessariamente a operação de pagamento original.

### 2. Orientação a objetos

**O que o `Evento` esconde e por quê? Por que o `reservar` é tudo ou nada? Por que os erros são uma hierarquia de classes?**

**Resposta:** A classe `Evento` utiliza o encapsulamento para proteger a lista de poltronas vendidas por meio do atributo privado `#poltronasVendidas`. Dessa forma, o estado interno do evento não pode ser modificado diretamente por outras partes do sistema. As alterações são realizadas pelos métodos `reservar` e `liberar`, que garantem o cumprimento das regras de negócio. O getter `disponivel` permite consultar a quantidade de poltronas livres sem permitir sua alteração direta.

O método `reservar` funciona no modelo tudo ou nada, pois valida todas as poltronas solicitadas antes de modificar o estado do evento. Caso exista uma poltrona inválida, repetida ou ocupada, nenhuma poltrona do pedido será reservada.

A hierarquia de erros utiliza a herança para centralizar o tratamento de exceções na classe abstrata `ErroDeNegocio`. Cada classe derivada possui seu próprio status HTTP, permitindo que o servidor identifique os erros de negócio e retorne respostas adequadas sem duplicar a lógica de tratamento.

### 3. Programação funcional

**O que ganhamos com `preco.ts` puro? Como vocês testariam ele sem subir o servidor?**

**Resposta:** A preencher.

### 4. Se fosse em outro paradigma

**Escolham uma das partes e expliquem como ficaria em outro paradigma, e se ficaria melhor ou pior.**

**Resposta:** A classe `Evento`, implementada utilizando programação orientada a objetos, também poderia ser desenvolvida utilizando o paradigma funcional.

Nesse cenário, o estado do evento seria representado por uma estrutura de dados imutável. As operações de reserva e liberação seriam funções que receberiam o estado atual e retornariam um novo estado, sem modificar o original.

Essa abordagem facilitaria os testes e reduziria efeitos colaterais. Entretanto, seria necessário gerenciar e substituir explicitamente o estado do evento a cada operação.

Para este projeto, a orientação a objetos é uma escolha adequada, pois permite encapsular o estado das poltronas e reunir os comportamentos e as regras de negócio em uma única classe. Isso facilita a organização, a manutenção e a proteção dos dados.

### 5. Concorrente × paralelo

**O Node roda o JavaScript numa linha só: os pedidos de vocês são concorrentes, não paralelos. O que mudaria se a venda rodasse em vários núcleos ao mesmo tempo?**

**Resposta:** No Node.js, a execução do código JavaScript ocorre em uma única thread por padrão. Entretanto, por meio do event loop e das operações assíncronas, vários pedidos podem permanecer em andamento simultaneamente, caracterizando a concorrência.

Enquanto um pedido aguarda o processamento do pagamento, outros pedidos podem ser recebidos e processados. Como a verificação e a reserva das poltronas são realizadas de forma síncrona, sem um `await` entre essas operações, outro pedido não consegue interromper essa etapa.

Caso o sistema fosse executado em vários núcleos com acesso simultâneo ao mesmo estado compartilhado, essa garantia deixaria de ser suficiente. Duas threads poderiam verificar a disponibilidade de uma poltrona ao mesmo tempo, antes que qualquer uma delas concluísse a reserva.

Nesse cenário, seria necessário utilizar mecanismos de sincronização, como mutexes, operações atômicas ou transações em um banco de dados, garantindo que a verificação e a reserva fossem realizadas como uma única operação indivisível.

Na implementação atual, não é necessário utilizar uma fila global ou um mutex, pois a reserva síncrona protege o estado dentro de uma única instância da aplicação, enquanto os pagamentos são processados concorrentemente.

## Resultados dos testes automatizados

Após a integração das implementações dos três integrantes na branch `main`, foram executados os testes automatizados fornecidos pelo professor.

| Categoria | Pontos obtidos | Pontuação máxima |
| :--- | ---: | ---: |
| Orientação a objetos | 3 | 3 |
| Programação funcional | 3 | 3 |
| Regras de meia-entrada | 1 | 1 |
| Programação concorrente | 7 | 7 |
| Serviço HTTP | 2 | 2 |
| **Total** | **16** | **16** |

Resultado final: **16 de 16 pontos (100%).**

Os testes validaram o encapsulamento do estado dos eventos, as regras de negócio, o cálculo dos preços, a reserva concorrente de poltronas, o processamento independente dos pedidos, o rollback em caso de falha de pagamento, o timeout da operadora e o funcionamento do serviço HTTP.

## Resultados do bench

| Cenário | Pedidos | Tempo (ms) | Vendidos | Poltrona ocupada | Falha de pagamento |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Padrão (`main.ts`) - Execução 1 | 200 | 863 | 99 | 89 | 12 |
| Padrão (`main.ts`) - Execução 2 | 200 | 234 | 87 | 100 | 13 |

O bench ocupa as poltronas do evento 1: para rodar de novo, parem o `npm start` (Ctrl+C) e subam outra vez.

### O que os números mostram

Na primeira execução local com as branches de preço, domínio e concorrência integradas, 99 das 100 poltronas do evento 1 foram vendidas. Os 89 retornos HTTP 409 indicam que a poltrona pedida já estava ocupada ou reservada no momento da tentativa. Os 12 retornos HTTP 502 indicam falhas do pagamento simulado, que devolvem a poltrona para a venda.

Como as falhas são aleatórias, as contagens e o tempo podem variar a cada execução.

Na segunda execução, foram processados 200 pedidos em 234 ms, atingindo uma taxa de 855 pedidos por segundo. Foram realizadas 87 vendas, registrados 100 conflitos de poltronas e 13 falhas de pagamento.

Ao final da segunda execução, o evento apresentou o seguinte estado:

| Indicador | Quantidade |
| :--- | ---: |
| Capacidade total | 100 |
| Poltronas vendidas | 87 |
| Poltronas disponíveis | 13 |

As 13 poltronas disponíveis são consistentes com as 13 falhas de pagamento registradas nessa execução, demonstrando o funcionamento do rollback.

Os resultados das duas execuções são consistentes com o respeito à capacidade máxima do evento. As diferenças de tempo e distribuição dos retornos podem ocorrer devido ao escalonamento dos pedidos, às condições do ambiente de execução e à natureza aleatória do pagamento simulado.