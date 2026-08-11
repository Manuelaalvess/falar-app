# Acessibilidade e CAA no Falar

Este documento descreve como o Falar aplica princípios de **Comunicação Alternativa e Aumentativa (CAA/AAC)** e de **design inclusivo para idosos e baixo letramento digital**. As decisões de interface foram tomadas com base na literatura clínica e em diretrizes de acessibilidade — não são escolhas estéticas arbitrárias.

## Público-alvo

| Perfil | Necessidade principal |
| ------ | --------------------- |
| Pessoa com **afasia pós-AVC** | Expressar necessidades sem depender da fala; interface estável e previsível |
| **Idoso** com menor familiaridade com celular | Botões grandes, poucos passos, feedback claro |
| **Baixo letramento digital** | Comunicação por símbolos (emoji) com apoio de voz, não por leitura |

O app foi validado em uso real (dois celulares, mesma conta) com paciente e cuidadora — alinhado à recomendação de **co-design e testes com usuários reais** (OpenAAC; Mazuz & Biswas, citados em revisão sistemática sobre apps para 60+).

## Princípios aplicados

### 1. Layout em grade semântica (grid AAC)

A tela **Comunicar** organiza o vocabulário em **categorias temáticas** (Preciso, Família, Lugar, Comida, Sentimento, Trabalho) — abordagem próxima aos *activity grid displays* e organização semântica descritos pela ASHA e por revisões sobre grades em CAA (Beukelman & Light, 2020; JAMS, 2025).

- **Por quê:** reduz latência de busca quando o vocabulário é pequeno e familiar; cada categoria tem cor própria para apoio visual (Wilkinson et al., 2017 — *clustering* por cor).
- **Limite consciente:** estudos com afasia mostram preferência por *Visual Scene Displays* (fotos de contexto) em alguns cenários (Brock et al., 2017; Thiessen et al., 2025). O Falar usa grade porque o vocabulário é curto, personalizado pela família, e emoji + TTS cobrem bem o caso doméstico.

### 2. Multimodalidade: símbolo + fala

Cada toque dispara **TTS em pt-BR** ou **gravação da voz da família** (local no aparelho). A ASHA enfatiza que sistemas AAC eficazes combinam modalidades (gesto, símbolo, fala sintética/gravada) conforme o contexto.

- Overlay de confirmação (emoji + nome) por ~2,5 s: feedback visual para quem processa melhor o visual do que o auditivo (Wilkinson & Jagaroo, 2004 — princípios de atenção visual).
- **Haptic feedback** leve no toque: reforço tátil sem depender só da audição.

### 3. Modo baixo letramento

Ativável na Área da família:

- Esconde rótulos de texto na grade (emoji domina).
- Fixa **Sim** e **Não** no topo — respostas binárias são centrais na comunicação com afasia e reduzem carga cognitiva (interfaces simples, sem menus profundos — DIS 2025, *Design Probes for AI-Driven AAC*).

### 4. Alvos de toque e espaçamento

| Elemento | Altura mínima | Referência |
| -------- | ------------- | ---------- |
| Categoria | 120 px (× escala) | WCAG 2.5.5 (44 px AAA); Material 48 dp |
| Item | 110 px (× escala) | Idem |
| Sim / Não | 88 px | Idem |
| Voltar | 48 px (× escala) | WCAG 2.5.8 (24 px AA) |

Espaçamento de 14 px entre tiles reduz toques acidentais (Fitts's Law; WCAG 2.5.8 — exceção por *spacing*).

### 5. Tipografia legível

- **Corpo:** [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) — desenhada para baixa visão e confusão entre glifos similares (Braille Institute).
- **Títulos:** Poppins — contraste com corpo, hierarquia clara.
- **Escala de fonte:** Normal (1×), Grande (1,25×), Extra grande (1,5×) — preferências persistidas localmente.

### 6. Contraste e cores

- Texto principal `#262A2E` sobre fundo `#F6F3ED`: contraste > 7:1 (WCAG AAA).
- Categorias com fundo claro + texto escuro na mesma família de matiz — apoio à busca visual sem poluir o símbolo (Wilkinson et al., 2017: fundo neutro em displays pequenos).

### 7. Estabilidade e previsibilidade

Pessoas com afasia tendem a rejeitar interfaces que mudam com frequência (“não gosto de ficar atualizando” — DIS 2025). O Falar:

- Mantém **mesma estrutura de telas** desde a validação.
- Ordena itens por **uso recente** (personalização), sem reorganizar categorias.
- Evita animações chamativas; pressed state sutil (opacidade + leve scale).

### 8. SOS tolerante a erro

- **1 toque:** lista contatos **com confirmação** antes de ligar.
- **2 toques rápidos:** liga direto — gesto deliberado para emergência real.

Separação intencional de gestos evita ligações acidentais (interfaces *error-tolerant* — revisão PMC 2025 sobre apps para idosos).

### 9. TalkBack / VoiceOver

- `accessibilityRole`, `accessibilityLabel` e `accessibilityHint` nos botões da tela Comunicar.
- Overlay de confirmação com `accessibilityLiveRegion="polite"` para anunciar o item falado.

## O que a família configura

Na aba **Perfil** → bloco **Tamanho da letra e dos botões**:

| Opção | Efeito |
| ----- | ------ |
| Escala de fonte | Aumenta emoji, rótulos e botões na Comunicar |
| Modo baixo letramento | Só emoji + Sim/Não fixos |

Recomendação prática: começar com **Grande** + **baixo letramento ligado** se o paciente tem dificuldade de leitura ou visão reduzida; ajustar com o paciente, não só pela cuidadora.

## Referências

1. **ASHA** — Augmentative and Alternative Communication (AAC). Practice Portal. https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/
2. **OpenAAC** — Considerations for AAC App Development. https://www.openaac.org/considerations.html
3. **W3C** — WCAG 2.2 Success Criterion 2.5.5 Target Size (Enhanced) e 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/
4. Brock, K. L., et al. (2017). A comparison of visual scene and grid displays for people with chronic aphasia. *Aphasiology*, 31(11), 1282–1306.
5. Thiessen, A., et al. (2025). How people with aphasia describe themes depicted in grid and visual scene displays. *Augmentative and Alternative Communication*.
6. Wilkinson, K. M., et al. (2017). Effects of background color and symbol arrangement cues on aided AAC design. *AAC*, 33(3), 160–169.
7. Revisão sistemática (2025). Optimizing mobile app design for older adults. *PMC*. https://pmc.ncbi.nlm.nih.gov/articles/PMC12350549/
8. ACM DIS 2025 — Design Probes for AI-Driven AAC: Addressing Complex Communication Needs in Aphasia.
9. Braille Institute — Atkinson Hyperlegible font. https://brailleinstitute.org/freefont

## Relacionados

- Requisitos: [`REQUISITOS.md`](REQUISITOS.md) (RNF02)
- Arquitetura: [`../ARCHITECTURE.md`](../ARCHITECTURE.md) (seção Comunicar)
- Testes manuais: [`TESTE_MANUAL.md`](TESTE_MANUAL.md)
