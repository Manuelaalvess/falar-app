# Requisitos do Falar

Documento de referência para portfolio e revisão técnica. Implementação detalhada em [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Contexto

App de CAA para uma pessoa com afasia pós-AVC e uma cuidadora. Dois celulares, mesma conta Firebase (login por telefone).

## Requisitos funcionais

| ID   | Requisito |
| ---- | --------- |
| RF01 | Paciente comunica tocando categorias e itens com emoji; app fala o item (TTS ou gravação local). |
| RF02 | Família personaliza itens e contatos na Área da família (PIN ou biometria). |
| RF03 | SOS com 1 toque: lista contatos e confirma antes de ligar. |
| RF04 | SOS com 2 toques: liga pro primeiro contato, registra alerta e notifica outros aparelhos por push. |
| RF05 | Dados compartilhados entre aparelhos via Firestore (itens, contatos, eventos, alertas). |
| RF06 | Resumo de evolução da comunicação, com opção de compartilhar. |
| RF07 | Login por telefone (Firebase Auth). |

## Requisitos não funcionais

| ID    | Requisito |
| ----- | --------- |
| RNF01 | Tela Comunicar utilizável offline após login (cache local de itens/contatos). |
| RNF02 | Botões e textos escaláveis; alvos de toque ≥48 px; labels para leitor de tela |
| RNF02a | Modo baixo letramento: interface só com símbolos + Sim/Não fixos |
| RNF02b | Tipografia Atkinson Hyperlegible (corpo) com contraste WCAG AAA no texto principal |
| RNF03 | Dados da família protegidos por Auth + `firestore.rules` (só o dono do uid). |
| RNF04 | PIN da família armazenado com hash, não em texto puro. |

## Restrições

- Sem Cloud Functions nem Firebase Storage no client (plano Spark, escopo familiar).
- Push enviado pelo aparelho que aciona o SOS (API Expo), não por servidor.
- Gravações de voz locais no aparelho (não sincronizam entre celulares).

## Critérios de aceite (SOS)

- Duplo toque abre discador **sem** pedir confirmação.
- Toque único **pede** confirmação antes de ligar.
- Com internet: push chega no outro aparelho em poucos segundos.
- Sem internet no paciente: ligação ainda funciona; alerta sincroniza depois.

Validação: [`TESTE_MANUAL.md`](TESTE_MANUAL.md).

Detalhes de acessibilidade e referências CAA: [`ACESSIBILIDADE.md`](ACESSIBILIDADE.md).
