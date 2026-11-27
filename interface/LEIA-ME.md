# Sessão B — Interface com mapa de assentos

## Instalação

Copie a pasta `interface` para a raiz do projeto Bilheteria-Race-Condition.
Caso tenha personalizado as artes, preserve uma cópia de `interface/assets` antes de substituir a pasta.
Não é necessário modificar `src`, `testes` ou `package.json`.

## Execução

Encerre os servidores anteriores com Ctrl+C. Execute na raiz do projeto:

Terminal 1 (backend com rota adicional do mapa):

```powershell
npx tsx interface/backend.ts
```

Terminal 2 (servidor da interface):

```powershell
node interface/servidor.cjs
```

Abra http://127.0.0.1:4173 e selecione um show.
Não execute `npm start` simultaneamente: ambos os backends usam a porta 3000.
O `npm start` original continua disponível para a entrega do professor, mas não oferece os números de poltronas ao minimapa.

## Funcionamento

- Lilás: livre; dourado: selecionado no formulário; cinza: indisponível (vendido ou em pagamento).
- Clique em um assento para preencher o campo da poltrona. Clique novamente para desmarcar.
- Se todos os campos estiverem preenchidos, selecionar outro assento adiciona um ingresso.
- A seleção local não bloqueia a poltrona; a reserva é confirmada pela API.
- O mapa é consultado a cada 2 segundos e após cada reserva ou disputa de concorrência.
- Reservas feitas em outras abas ou diretamente na API aparecem no mapa. Em caso de falha no pagamento, o rollback libera a poltrona.
- O mapa usa os mesmos IDs, preços, capacidades e parâmetros de pagamento do `src/main.ts` original.
- Os lugares voltam a ficar livres quando o backend é reiniciado, pois o projeto mantém as reservas em memória.
- Se for iniciado o servidor original sem a rota `/mapa`, os lugares aparecerão como não confirmados, e a reserva manual continuará disponível.

## Arquivos

- `index.html`: HTML, CSS e JavaScript da interface; configuração das artes no objeto `shows`.
- `assets`: imagens dos três shows fictícios.
- `backend.ts`: inicializador adicional que reutiliza as classes do projeto; a subclasse `EventoComMapa` acompanha as chamadas bem-sucedidas de `reservar` e `liberar`.
- `servidor.cjs`: servidor da interface e encaminhamento das rotas da API.

## Validação

Com os servidores encerrados, execute `npm test` na raiz do projeto para confirmar a pontuação original.
