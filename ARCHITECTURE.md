# Arquitetura do Falar

Notas técnicas sobre como o app funciona e por que algumas coisas foram feitas desse jeito. O setup rápido está no `README.md`.

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

Um app só, uma conta por telefone, dois aparelhos logados nela. Não existe "app da família" separado. Itens, contatos, eventos, alertas de SOS e tokens de push ficam em `users/{uid}/...` e sincronizam com `onSnapshot`.

No código, telas montam a UI, hooks ligam Firestore e cache, services falam com Firebase, Expo e arquivos locais.

### Camadas

| Camada | Responsabilidade |
| ------ | ---------------- |
| `screens/` | Fluxos de tela (login, Comunicar, admin) |
| `components/` | UI reutilizável (SOS, PIN, modais) |
| `hooks/` | Estado React, subscriptions Firestore, cache local |
| `services/` | Integrações externas (Firebase, Expo, filesystem) |
| `store/` | Estado global compartilhado (Zustand) |
| `utils/` | Funções puras (stats, ordenação) |

Hooks de dados (`useItems`, `useEmergencyContacts`) usam `useCachedFirestoreSubscription` para ler cache offline e sincronizar com `onSnapshot`.

## Firestore

Tudo abaixo de `users/{uid}/`, com `firestore.rules` (só o dono da conta acessa, campos validados):

```
users/{uid}/
├── items
├── emergencyContacts
├── events
├── emergencyAlerts
└── devices
```

| Coleção             | O que guarda                                  | Escrita                 |
| ------------------- | --------------------------------------------- | ----------------------- |
| `items`             | Itens de comunicação (categoria, nome, emoji) | create e delete         |
| `emergencyContacts` | Contatos de emergência                        | create e delete         |
| `events`            | Log pra aba Evolução                          | só create e leitura     |
| `emergencyAlerts`   | Histórico do SOS de duplo toque               | só create e leitura     |
| `devices`           | Token de push por aparelho                    | create, update e delete |

## Login

Telefone + SMS (ou número de teste no console). reCAPTCHA em WebView (`RecaptchaVerifierModal.tsx`) pra rodar no Expo Go. Sessão fica no AsyncStorage (`services/firebase.ts`).

## Comunicar

`ComunicarScreen` lista categorias (`constants/communication.ts`). Ao abrir uma, mostra itens ordenados por uso (`utils/personalization.ts`). Ao tocar:

1. Toca gravação local da família se existir (`audioRecordings.ts`); senão TTS.
2. Grava evento em `events`.

**Modo baixo letramento:** esconde rótulos (só emoji) e botões fixos Sim/Não — ver [`docs/ACESSIBILIDADE.md`](docs/ACESSIBILIDADE.md).

**Acessibilidade:** escala de fonte (1×–1,5×), haptic no toque, overlay de confirmação visual, `accessibilityLabel`/`Hint` nos tiles. Constantes em `src/constants/accessibility.ts`.

## SOS

Dois gestos, propósitos diferentes:

- **1 toque:** sheet com contatos, confirma antes de ligar (`EmergencySheet.tsx`). Dá pra mandar SMS manual com localização.
- **2 toques rápidos:** liga direto pro primeiro contato com telefone, grava alerta em `emergencyAlerts` com GPS se der, **sem abrir SMS depois** (isso tirava o paciente do discador). A cuidadora vê em "Último SOS".

GPS é tentativa única (`expo-location`). Se falhar, o alerta grava mesmo, só sem link de mapa.

## Push do SOS (sem Cloud Functions)

Cloud Functions exige plano Blaze. Preferi não depender disso (mesmo motivo de não usar Storage na nuvem). Quem aciona o SOS avisa os outros aparelhos:

1. No login, cada um registra token Expo em `devices/{deviceId}` (`usePushRegistration.ts`).
2. No duplo toque, depois de ligar, busca tokens dos outros aparelhos e chama a API pública da Expo (`expoPush.ts`).
3. No logout, remove o token deste aparelho (`App.tsx`).

**Limitação:** precisa de internet no aparelho que acionou. Não tem fila no servidor. Push só funciona de verdade com `projectId` da EAS no `app.json` (ver EAS abaixo).

## Offline

- Login: sessão persiste; abre logado sem rede.
- Itens e contatos: `useItems` e `useEmergencyContacts` leem cache (`localCache`) e atualizam quando o Firestore responde.
- Gravações de voz: só no aparelho, sem rede.
- Área da família (criar/apagar itens e contatos): precisa de internet.
- Online, o Firestore manda. Offline, o cache evita tela vazia; não tem resolução de conflito custom.

## Segurança

- Auth só por telefone.
- `firestore.rules` limita acesso ao `uid` logado.
- PIN da família: hash SHA-256 no Secure Store; biometria opcional.
- `.env` com `EXPO_PUBLIC_*` não vai pro Git. API key do Firebase é pública no client; proteção real é Auth + rules.

## PIN e biometria

`AdminGateModal`: PIN de 4 dígitos ou biometria no primeiro acesso à Área da família.

## Gravações de voz (só locais)

Família grava no aparelho (`expo-av` + filesystem). **Não sincroniza.** Já existiu sync na nuvem e saiu: o paciente usa um celular só, e Storage exigiria Blaze. Se mudar o caso de uso, dá pra reavaliar.

## Build (EAS)

```bash
npx eas-cli login
npx eas-cli build --profile preview --platform android
```

APK interno, sem loja. O primeiro build preenche `projectId` no `app.json`, necessário pro push.

## Limitações

- Duplo toque **não manda SMS automático**, só liga. No 1 toque, SMS manual; no iOS o usuário precisa tocar Enviar no app Mensagens.
- Push depende de internet no aparelho que acionou.
- Editar itens/contatos exige conexão.

## Testes

Jest cobre utils (`personalization`, `evolutionStats`) e partes de services (`auth`, `emergencyActions`). Telas, push, GPS e fluxo completo: roteiro em `docs/TESTE_MANUAL.md`.

## Firestore: índices

Nenhum índice composto hoje. Consultas com `orderBy` em um campo só (`events`, `emergencyAlerts`).

## Comandos úteis

```bash
npm install
cp .env.example .env
npm start
```

Regras:

```bash
npx firebase-tools deploy --only firestore:rules --project <seu-project-id>
```

Verificação local (igual ao CI):

```bash
npm run validate
```
