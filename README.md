# Falar

Aplicativo de comunicação por toque para pacientes pós-AVC com afasia. Permite que o paciente expresse necessidades básicas tocando em categorias e itens ilustrados, com leitura em voz alta, enquanto a família personaliza o conteúdo e acompanha o uso.

## Funcionalidades

- Comunicação por toque: categorias e itens com emoji ou foto, lidos em voz alta (pt-BR).
- Botão de emergência fixo, com ligação direta para contatos da família.
- Área da família: personalização de categorias/itens, contatos de emergência e acompanhamento de uso.
- Autenticação por telefone.
- Registro de eventos de comunicação e resumo de evolução para acompanhamento fonoaudiológico.

## Stack

- [Expo](https://expo.dev) + React Native + TypeScript
- Firebase (Auth, Firestore, Storage)
- expo-speech (síntese de voz), expo-image-picker / expo-image-manipulator (fotos)

## Rodando localmente

Pré-requisitos: Node.js 20+, npm, o app Expo Go no celular ou um emulador Android/iOS configurado.

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Firebase
npm start
```

Outros comandos úteis:

```bash
npm run android   # abre no emulador/dispositivo Android
npm run ios       # abre no simulador iOS (requer macOS)
npm run web       # abre no navegador
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # checagem de tipos TypeScript
```

## Variáveis de ambiente

Definidas em `.env` (veja `.env.example`), todas com prefixo `EXPO_PUBLIC_` para ficarem disponíveis no bundle do app:

| Variável                                   | Descrição                           |
| ------------------------------------------ | ----------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Chave de API do projeto Firebase    |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Domínio de autenticação             |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | ID do projeto                       |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Bucket de Storage (fotos dos itens) |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID                           |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | ID do app no Firebase               |

No console do Firebase, o provedor **Phone** precisa estar habilitado em Authentication > Sign-in method. Para testar sem consumir SMS reais, cadastre números de teste em Authentication > Sign-in method > Phone numbers for testing.

O login envia o código de verificação usando `signInWithPhoneNumber` com um reCAPTCHA em WebView (`expo-firebase-recaptcha`), funcionando direto no Expo Go, sem precisar gerar build nativa.

## Estrutura de pastas

```
src/
  screens/     telas do app (Comunicar, Login, Área da família, Evolução...)
  components/  componentes reutilizáveis de UI
  services/    integrações externas (Firebase, TTS, storage local)
  hooks/       hooks React customizados
  types/       tipos e interfaces compartilhados
  theme/       tokens de design (cores, tipografia, espaçamento)
  constants/   dados estáticos (categorias padrão, etc.)
```
