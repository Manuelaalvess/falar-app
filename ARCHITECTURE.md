# Arquitetura — Falar

Documento técnico de referência. Complementa o `README.md` (visão geral e setup rápido) com o *porquê* das decisões e os detalhes de operação.

## Visão geral

```
┌─────────────────────┐        ┌─────────────────────┐
│  Celular do pai       │        │  Celular da filha     │
│  (paciente)           │        │  (cuidadora)          │
│                       │        │                       │
│  Comunicar (emoji+TTS)│        │  Área da família      │
│  Botão SOS            │        │  (PIN/biometria)      │
└──────────┬────────────┘        └──────────┬────────────┘
           │                                │
           │        mesma conta Firebase (login por telefone)
           └───────────────┬────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Firestore     │
                    │ users/{uid}/... │
                    └────────────────┘
```

Um único app, uma única conta (autenticação por telefone), dois aparelhos logados nela — não há um "app da família" separado. Tudo o que é compartilhado (itens, contatos, eventos, alertas de SOS, tokens de notificação) vive em `users/{uid}/...` no Firestore e sincroniza entre os dois aparelhos automaticamente via `onSnapshot`.

## Coleções do Firestore

Todas abaixo de `users/{uid}/`, protegidas por `firestore.rules` (só o dono da conta lê/escreve, com validação de schema por campo):

| Coleção              | Conteúdo                                          | Mutabilidade                          |
| --------------------- | -------------------------------------------------- | -------------------------------------- |
| `items`               | Itens de comunicação (categoria, nome, emoji)       | create + delete (sem update)            |
| `emergencyContacts`   | Contatos de emergência                              | create + delete (sem update)            |
| `events`              | Log de comunicações (pra tela de Evolução)          | create + read (imutável)                |
| `emergencyAlerts`     | Histórico de acionamentos do SOS de duplo toque     | create + read (imutável)                |
| `devices`             | Token de push por aparelho logado na conta          | create + update + delete (mutável)      |

## Fluxo: Comunicar

`ComunicarScreen` mostra as categorias (`src/constants/communication.ts`); ao tocar uma, mostra os itens dela ordenados por frequência de uso (`utils/personalization.ts`). Ao escolher um item:

1. Toca a gravação de voz da família se existir (`services/audioRecordings.ts`, local no aparelho); senão usa TTS (`expo-speech`).
2. Registra o evento em `events` (para a aba Evolução).

**Modo baixo letramento** (opcional, ligado na Área da família): esconde os rótulos de texto dos tiles (só emoji fica), mostra botões fixos "Sim"/"Não" sempre visíveis, e fala o item destacado durante a varredura por botão único.

## Fluxo: SOS

Dois gestos com comportamentos deliberadamente diferentes:

- **1 toque** → abre um sheet com a lista de contatos; **confirma antes de ligar** (`EmergencySheet.tsx`). Permite também enviar SMS manual com localização.
- **2 toques rápidos** → aciona direto, **sem confirmação** (é o caminho de emergência real): liga (`tel:`) para o primeiro contato com telefone cadastrado e grava um alerta em `emergencyAlerts` com localização GPS (se disponível) e horário. **Não abre SMS em sequência** — isso tirava o paciente do discador/do app. A filha vê o registro em "Último SOS" na aba Emergência.

Localização é best-effort (`expo-location`, fix único de GPS) — se falhar (sem sinal, sem internet), o alerta ainda é gravado, só sem `mapsUrl`.

## Notificação push do SOS (sem Cloud Functions)

Cloud Functions do Firebase exigem o plano pago Blaze para qualquer deploy, mesmo dentro da cota gratuita — decisão de produto foi não depender disso (mesma razão pela qual o Storage de fotos/áudio na nuvem não está ativo). Em vez de um gatilho de servidor, o **próprio aparelho que aciona o SOS** notifica os outros:

1. No login, cada aparelho pede permissão de notificação (`expo-notifications`) e registra seu Expo push token em `users/{uid}/devices/{deviceId}` (`hooks/usePushRegistration.ts`).
2. Ao acionar o duplo toque, depois de ligar, o app busca os tokens dos *outros* aparelhos da conta (`services/pushTokens.ts`) e chama direto a API pública da Expo (`services/expoPush.ts`, `POST https://exp.host/--/api/v2/push/send`) — sem servidor.
3. Ao sair da conta, o token deste aparelho é removido (`App.tsx`'s `handleSignOut`), evitando notificar um aparelho deslogado.

**Trade-off:** menos "formal"/centralizado que um gatilho de servidor (depende do aparelho que aciona o SOS estar com internet no momento), mas suficiente para a topologia de 2 aparelhos do produto e sem custo/infra extra.

**Pré-requisito para funcionar de verdade:** o token do Expo só é gerado quando o app tem um `projectId` da EAS configurado (ver seção EAS abaixo) — sem isso, o registro falha silenciosamente sem quebrar o resto do app.

## PIN e biometria (Área da família)

`AdminGateModal` protege o acesso: PIN de 4 dígitos (hash SHA-256 via `expo-crypto`, guardado no `expo-secure-store`, nunca em texto puro) ou biometria (`expo-local-authentication`, opt-in). Configurado no primeiro acesso.

## Gravações de voz — só locais, de propósito

A família grava a própria voz dizendo o nome de cada item (`expo-av` + `expo-file-system`), guardado só no armazenamento local do aparelho (`services/audioRecordings.ts`). **Não sincroniza entre aparelhos.** Isso foi implementado e depois removido deliberadamente: o caso de uso real é um único aparelho (o do paciente), então sincronização na nuvem seria complexidade sem benefício — e exigiria ativar o Firebase Storage no plano pago Blaze, que o produto optou por não usar. Se o caso de uso mudar (múltiplos aparelhos do paciente), reavaliar reintroduzindo `getStorage` só para esse propósito.

## Build instalável (EAS)

Para o paciente não depender do Expo Go:

```bash
npx eas-cli login
npx eas-cli build --profile preview --platform android
```

Gera um APK de distribuição interna (não passa pela loja). O primeiro `eas login`/`build` também cria o `projectId` da EAS em `app.json`, necessário para o push funcionar de verdade (ver seção acima).

## Limitações conhecidas

- **SMS automático não é enviado pelo client** no duplo toque — só liga. O 1-toque abre SMS manual, mas no **iOS o usuário precisa tocar em Enviar** no app Mensagens (limitação do sistema operacional, a Apple não permite apps de terceiros enviarem SMS sem interação do usuário).
- Notificação push depende do aparelho que aciona o SOS ter internet no momento (não há retry/fila em servidor).
- Edição de itens/contatos exige conexão (só a leitura/comunicação funciona 100% offline, via cache local).

## Índices do Firestore

Nenhum índice composto é necessário hoje: as únicas consultas com `orderBy` (`events` por `timestamp desc`, `emergencyAlerts` por `createdAt desc`) usam um único campo de ordenação sem `where` adicional, cobertas pelos índices automáticos de campo único do Firestore.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Firebase
npm start
```

Publicar as regras do Firestore:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <seu-project-id>
```

Rodar a suíte de verificação (mesma que o CI roda):

```bash
npm run typecheck
npm run lint
npm test
```
