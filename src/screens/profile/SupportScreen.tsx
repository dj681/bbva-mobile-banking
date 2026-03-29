import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Divider } from '@/components/common/Divider';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/types';

type SupportNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Support'>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'pin',
    question: '¿Cómo puedo restablecer mi PIN?',
    answer:
      'Vaya a Perfil → Seguridad → Código PIN → Cambiar PIN. Necesitará su contraseña actual para confirmar el cambio.',
  },
  {
    id: 'block_card',
    question: '¿Cómo puedo bloquear mi tarjeta?',
    answer:
      'En la pestaña Tarjetas, seleccione su tarjeta y pulse "Bloquear tarjeta". En caso de urgencia, llame al 0800 000 001 (24 h/24 h).',
  },
  {
    id: 'fees',
    question: '¿Cuáles son los gastos de transferencia?',
    answer:
      'Las transferencias SEPA en la zona euro son gratuitas. Las transferencias internacionales fuera de la zona SEPA se cobran según la tarifa disponible en las Condiciones de uso.',
  },
  {
    id: 'biometric',
    question: '¿Cómo puedo activar la biometría?',
    answer:
      'Vaya a Perfil → Seguridad → Biometría y active la función Face ID / Huella dactilar. Asegúrese de que la biometría esté configurada en su dispositivo.',
  },
  {
    id: 'sepa_delay',
    question: '¿Cuáles son los plazos de las transferencias SEPA?',
    answer:
      'Las transferencias SEPA instantáneas se procesan en pocos segundos. Las transferencias SEPA estándar se ejecutan el siguiente día hábil antes de las 22:00 h si se realizan antes de las 17:00 h.',
  },
  {
    id: 'statement',
    question: '¿Cómo puedo obtener un extracto de cuenta?',
    answer:
      'Sus extractos mensuales están disponibles en Cuentas → seleccione su cuenta → Extractos. Puede descargarlos en PDF o recibirlos por correo electrónico.',
  },
];

// Canned bot responses based on keywords
function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('pin') || msg.includes('code')) {
    return 'Pour réinitialiser votre PIN, allez dans Profil → Sécurité → Code PIN → Modifier le PIN. Besoin d\'aide supplémentaire ?';
  }
  if (msg.includes('carte') || msg.includes('card') || msg.includes('bloquer')) {
    return 'Pour bloquer votre carte, rendez-vous dans l\'onglet Cartes et sélectionnez votre carte. Pour une urgence, appelez le 0800 000 001.';
  }
  if (msg.includes('virement') || msg.includes('transfer')) {
    return 'Las transferencias SEPA generalmente se procesan el siguiente día hábil. Las transferencias instantáneas se ejecutan en pocos segundos.';
  }
  if (msg.includes('biométr') || msg.includes('faceid') || msg.includes('empreinte')) {
    return 'Para activar la biometría: Perfil → Seguridad → Biometría → active Face ID / Huella dactilar.';
  }
  if (msg.includes('relevé') || msg.includes('statement')) {
    return 'Sus extractos están disponibles en Cuentas → seleccione su cuenta → Extractos. Puede descargarlos en PDF.';
  }
  if (msg.includes('solde') || msg.includes('balance')) {
    return 'Votre solde est affiché sur le tableau de bord. Pour les détails, consultez l\'onglet Comptes.';
  }
  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello')) {
    return '¡Hola! Soy su asistente de BBVA. ¿En qué puedo ayudarle hoy?';
  }
  if (msg.includes('merci') || msg.includes('thank')) {
    return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. 😊';
  }
  return 'Entiendo su consulta. Para una atención personalizada, también puede llamar a nuestro servicio de atención al cliente al 0800 123 456 o consultar nuestras Preguntas frecuentes a continuación.';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
const SupportScreen: React.FC = () => {
  const navigation = useNavigation<SupportNavProp>();
  const { colors, spacing, borderRadius } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      text: '¡Hola! ¿En qué puedo ayudarle?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: getBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  }, [inputText]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  const styles = makeStyles(colors, spacing, borderRadius);

  const renderChatBubble = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="headset" size={16} color="#FFFFFF" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte al cliente</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pageContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contact options */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contáctenos</Text>
            <View style={styles.contactGrid}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => Linking.openURL('tel:0800123456').catch(() => {})}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="call" size={22} color="#003366" />
                </View>
                <Text style={styles.contactLabel}>Llamar al soporte</Text>
                <Text style={styles.contactValue}>0800 123 456</Text>
                <Text style={styles.contactNote}>Gratuito · 24 h/24 h</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="chatbubbles" size={22} color="#2E7D32" />
                </View>
                <Text style={styles.contactLabel}>Iniciar un chat</Text>
                <Text style={styles.contactValue}>Chat en direct</Text>
                <Text style={styles.contactNote}>Respuesta inmediata</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactCard}
                onPress={() =>
                  Linking.openURL('mailto:support@bbva.fr').catch(() => {})
                }
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="mail" size={22} color="#F57F17" />
                </View>
                <Text style={styles.contactLabel}>Enviar un correo electrónico</Text>
                <Text style={styles.contactValue}>support@bbva.fr</Text>
                <Text style={styles.contactNote}>Respuesta en 24 h</Text>
              </TouchableOpacity>
            </View>

            {/* Hours */}
            <View style={styles.hoursBox}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.hoursText}>
                Asesores disponibles: Lun–Vie 8:00–20:00 · Sáb 9:00–17:00
              </Text>
            </View>
          </View>

          {/* Chat section */}
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Chat en direct</Text>

            <View style={styles.chatContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderChatBubble}
                scrollEnabled={false}
                contentContainerStyle={styles.chatList}
                ListFooterComponent={
                  isTyping ? (
                    <View style={styles.bubbleRow}>
                      <View style={styles.botAvatar}>
                        <Ionicons name="headset" size={16} color="#FFFFFF" />
                      </View>
                      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                        <Text style={styles.typingDots}>• • •</Text>
                      </View>
                    </View>
                  ) : null
                }
              />

              <View style={styles.chatInputRow}>
                <TextInput
                  style={[styles.chatInput, { color: colors.text, borderColor: colors.border }]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Escriba su mensaje..."
                  placeholderTextColor={colors.placeholder}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  multiline={false}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? '#FFFFFF' : colors.textDisabled}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>

            <View style={styles.faqCard}>
              {FAQ_ITEMS.map((faq, index) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <React.Fragment key={faq.id}>
                    <TouchableOpacity
                      style={styles.faqRow}
                      onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                    {index < FAQ_ITEMS.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, spacing: any, borderRadius: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.header,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      paddingTop: spacing.lg,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.headerText,
      textAlign: 'center',
    },
    headerPlaceholder: {
      width: 32,
    },
    pageContent: {
      paddingBottom: spacing.xxxl,
    },
    // Contact
    contactSection: {
      padding: spacing.md,
      paddingBottom: 0,
    },
    contactTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    contactGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    contactCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    contactIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    contactLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 2,
    },
    contactValue: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
      textAlign: 'center',
    },
    contactNote: {
      fontSize: 9,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    hoursBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.sm + 2,
      marginBottom: spacing.md,
    },
    hoursText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 17,
    },
    // Chat
    chatSection: {
      padding: spacing.md,
      paddingTop: 0,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    chatContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    chatList: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    bubbleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    bubbleRowUser: {
      flexDirection: 'row-reverse',
    },
    botAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#003366',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    bubble: {
      maxWidth: '78%',
      borderRadius: borderRadius.lg,
      padding: spacing.sm + 2,
    },
    bubbleBot: {
      backgroundColor: colors.background,
      borderBottomLeftRadius: 4,
    },
    bubbleUser: {
      backgroundColor: '#003366',
      borderBottomRightRadius: 4,
    },
    bubbleText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    bubbleTextUser: {
      color: '#FFFFFF',
    },
    bubbleTime: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'right',
    },
    bubbleTimeUser: {
      color: 'rgba(255,255,255,0.7)',
    },
    typingBubble: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    typingDots: {
      fontSize: 18,
      color: colors.textSecondary,
      letterSpacing: 4,
    },
    chatInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    chatInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      fontSize: 14,
      backgroundColor: colors.background,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#003366',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.border,
    },
    // FAQ
    faqSection: {
      padding: spacing.md,
      paddingTop: 0,
    },
    faqCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    faqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 20,
    },
    faqAnswer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    faqAnswerText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 19,
    },
  });

export default SupportScreen;
