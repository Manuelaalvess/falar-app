import type { FirebaseOptions } from 'firebase/app';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

export interface RecaptchaVerifierHandle {
  readonly type: 'recaptcha';
  verify(): Promise<string>;
}

interface RecaptchaVerifierModalProps {
  firebaseConfig: FirebaseOptions;
  title?: string;
  cancelLabel?: string;
}

const FIREBASE_JS_VERSION = '10.12.2';

function buildRecaptchaHtml(firebaseConfig: FirebaseOptions): string {
  return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <script src="https://www.gstatic.com/firebasejs/${FIREBASE_JS_VERSION}/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/${FIREBASE_JS_VERSION}/firebase-auth-compat.js"></script>
  <script>firebase.initializeApp(${JSON.stringify(firebaseConfig)});</script>
  <style>
    html, body { margin: 0; padding: 16px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; min-height: 100%; }
  </style>
</head>
<body>
  <div id="recaptcha-container"></div>
  <script>
    function post(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    window.onload = function () {
      post({ type: 'load' });
      try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'normal',
          callback: function (token) { post({ type: 'verify', token: token }); },
          'expired-callback': function () { post({ type: 'error' }); }
        });
        window.recaptchaVerifier.render();
      } catch (error) {
        post({ type: 'error' });
      }
    };
  </script>
</body></html>`;
}

export const RecaptchaVerifierModal = forwardRef<
  RecaptchaVerifierHandle,
  RecaptchaVerifierModalProps
>(({ firebaseConfig, title = 'Verificação de segurança', cancelLabel = 'Cancelar' }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolveRef = useRef<((token: string) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    type: 'recaptcha' as const,
    verify: () =>
      new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        setLoaded(false);
        setVisible(true);
      }),
  }));

  function handleMessage(event: WebViewMessageEvent) {
    const data = JSON.parse(event.nativeEvent.data) as { type: string; token?: string };
    if (data.type === 'load') {
      setLoaded(true);
    } else if (data.type === 'verify' && data.token) {
      resolveRef.current?.(data.token);
      setVisible(false);
    } else if (data.type === 'error') {
      rejectRef.current?.(new Error('Falha ao carregar o reCAPTCHA'));
      setVisible(false);
    }
  }

  function handleCancel() {
    rejectRef.current?.(new Error('Verificação cancelada pelo usuário'));
    setVisible(false);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={handleCancel}>
            <Text style={styles.cancel}>{cancelLabel}</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <WebView
            javaScriptEnabled
            originWhitelist={['*']}
            source={{
              baseUrl: `https://${firebaseConfig.authDomain}`,
              html: buildRecaptchaHtml(firebaseConfig),
            }}
            onMessage={handleMessage}
          />
          {!loaded ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

RecaptchaVerifierModal.displayName = 'RecaptchaVerifierModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  title: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.label,
    color: colors.ink,
  },
  cancel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
  },
  content: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
