# Roteiro de teste manual

Uns 15 minutos, dois aparelhos reais (celular do pai + celular da filha), mesma conta.

**Último teste:** 05/08/2026, dois aparelhos reais. Comunicar, SOS (1 e 2 toques), push, PIN e Evolução ok. Revalidar som após ajustes (toque no item → fala; app aberto em silêncio).

## Preparação

- [ ] App instalado (EAS preview ou Expo Go), mesmos login nos dois.
- [ ] Pelo menos 1 contato de emergência com telefone na Área da família.
- [ ] Notificações permitidas (idealmente no celular da filha).

## 1. Comunicar (celular do pai)

- [ ] Abrir categoria "Preciso de", tocar item. Áudio (gravação ou TTS).
- [ ] Outra categoria, confirmar navegação e áudio.
- [ ] Ligar modo baixo letramento na família, voltar ao Comunicar. Textos somem dos tiles, Sim/Não no topo.

## 2. SOS com 1 toque

- [ ] Um toque no botão vermelho abre lista.
- [ ] Escolher contato: pede confirmação antes de ligar.
- [ ] Cancelar: não liga.

## 3. SOS com 2 toques (com internet)

- [ ] Dois toques rápidos: discador direto, sem confirmação, primeiro contato com telefone.
- [ ] Nenhum SMS abre em seguida.
- [ ] Celular da filha: push "SOS acionado no Falar" em alguns segundos.
- [ ] Área da família > Emergência: "Último SOS" com data, contato e mapa (se GPS respondeu).

## 4. SOS com 2 toques (sem internet no pai)

- [ ] Modo avião ou sem Wi‑Fi/dados no pai.
- [ ] Dois toques: ligação ainda funciona (chip).
- [ ] App não trava nem mostra erro pro paciente.
- [ ] Voltar internet, reabrir Emergência: "Último SOS" sincroniza (aviso "Ainda não confirmado na nuvem" some).
- [ ] Push pra filha **não** chega sem internet no pai (esperado).

## 5. Área da família (PIN)

- [ ] Botão Família pede PIN ou biometria.
- [ ] PIN errado nega.
- [ ] PIN certo entra.
- [ ] Trocar PIN em Segurança, sair e entrar de novo.

## 6. Evolução

- [ ] Resumo: total, categoria mais usada, gráfico 7 dias.
- [ ] Compartilhar resumo abre share nativo.

## Resultado

Tudo passou sem travar? Se não, anotar aparelho, passo e o que aconteceu.
