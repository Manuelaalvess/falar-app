# Roteiro de teste manual — Falar

Cerca de 15 minutos, com os dois aparelhos reais (celular do pai + celular da filha), logados na mesma conta.

## Preparação (2 min)

- [ ] Os dois celulares estão com o app instalado (build EAS `preview` ou Expo Go) e logados com o mesmo número de telefone.
- [ ] Na Área da família (qualquer um dos dois aparelhos), há pelo menos 1 contato de emergência com telefone cadastrado.
- [ ] Notificações estão permitidas para o app em pelo menos um dos aparelhos (idealmente o da filha).

## 1. Comunicar (celular do pai) — 3 min

- [ ] Abrir uma categoria (ex: "Preciso de") e tocar um item — toca a gravação de voz da família (se existir) ou fala por TTS.
- [ ] Voltar e abrir outra categoria — confirma que a navegação e o áudio funcionam em mais de uma categoria.
- [ ] Na Área da família, ligar o "Modo baixo letramento" e voltar pro Comunicar — confirma que os textos somem dos tiles e os botões fixos "Sim"/"Não" aparecem no topo.

## 2. SOS — 1 toque (celular do pai) — 2 min

- [ ] Tocar uma vez no botão vermelho — abre a lista de contatos.
- [ ] Escolher um contato — o app **pede confirmação** antes de ligar.
- [ ] Cancelar a confirmação — confirma que a ligação não é iniciada.

## 3. SOS — 2 toques, com internet (celular do pai) — 3 min

- [ ] Tocar duas vezes rápido no botão vermelho.
- [ ] Confirma que o discador abre **direto, sem pedir confirmação**, ligando para o primeiro contato com telefone.
- [ ] Confirma que **nenhum SMS é aberto** em seguida.
- [ ] No celular da filha: chega uma notificação push ("SOS acionado no Falar") em até alguns segundos.
- [ ] Na Área da família (qualquer aparelho) → aba Emergência: aparece o bloco "Último SOS" com data/hora, nome do contato e link de localização (se o GPS respondeu a tempo).

## 4. SOS — 2 toques, sem internet (celular do pai) — 3 min

- [ ] Ativar modo avião (ou desligar Wi-Fi/dados) no celular do pai.
- [ ] Tocar duas vezes rápido no botão vermelho.
- [ ] Confirma que a ligação **ainda funciona** (usa a rede do chip, não precisa de internet).
- [ ] Confirma que o app não trava nem mostra erro pro paciente.
- [ ] Reativar a internet e reabrir a Área da família → Emergência: o "Último SOS" aparece com o aviso "Ainda não confirmado na nuvem" até sincronizar, depois some o aviso.
- [ ] (Sem internet no momento do toque, a notificação push para a filha não é enviada — esperado, documentado em `ARCHITECTURE.md`.)

## 5. Gate da Área da família — 2 min

- [ ] Tocar no botão "⚙️ Família" na tela principal — pede PIN ou biometria (o que estiver configurado).
- [ ] Errar o PIN/biometria — nega o acesso.
- [ ] Acertar — entra na Área da família.
- [ ] Trocar o PIN em Segurança e sair/entrar de novo pra confirmar que o novo PIN vale.

## 6. Evolução — 2 min

- [ ] Aba Evolução mostra o resumo (total de comunicações, categoria mais usada, gráfico dos últimos 7 dias).
- [ ] Tocar "Compartilhar resumo" — abre o menu de compartilhamento nativo do celular com o texto do relatório.

## Resultado esperado

Todos os itens acima devem passar sem erros visíveis nem travamentos. Falhas encontradas: anotar aparelho, passo e comportamento observado antes de reportar.
