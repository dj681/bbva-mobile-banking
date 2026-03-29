import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';
import type { Card, CardNetwork, CardType } from '@/types';

interface CreditCardProps {
  card: Card;
  onPress?: (card: Card) => void;
  style?: ViewStyle;
}

const NETWORK_LABEL: Record<CardNetwork, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'AMEX',
};

const TYPE_GRADIENT: Record<CardType, { top: string; bottom: string }> = {
  debit: { top: '#003366', bottom: '#001F42' },
  credit: { top: '#004B9A', bottom: '#0D0D5C' },
  prepaid: { top: '#006BAA', bottom: '#003366' },
};

// Credit card proportions: 85.6 × 53.98 mm → ratio ≈ 1.586
const CARD_RATIO = 85.6 / 53.98;

export const CreditCard: React.FC<CreditCardProps> = ({ card, onPress, style }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const gradient = TYPE_GRADIENT[card.type];
  const isBlocked = card.status === 'blocked' || card.status === 'expired';

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => setIsFlipped(prev => !prev));
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimStyle = { transform: [{ rotateY: backInterpolate }] };

  return (
    <TouchableOpacity
      onPress={() => {
        handleFlip();
        onPress?.(card);
      }}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`Tarjeta ${card.type} de ${card.holderName} terminada en ${card.cardNumber.slice(-4)}`}
      style={[styles.wrapper, style]}
    >
      {/* Front */}
      <Animated.View style={[styles.card, frontAnimStyle]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: gradient.top }]} />
        <View style={[StyleSheet.absoluteFill, styles.gradientBottom, { backgroundColor: gradient.bottom }]} />

        {/* Decorative circles */}
        <View style={styles.circleA} />
        <View style={styles.circleB} />

        {/* Blocked overlay */}
        {isBlocked && (
          <View style={styles.blockedOverlay}>
            <Ionicons name="lock-closed" size={20} color={COLORS.white} />
            <Text style={styles.blockedText}>
              {card.status === 'expired' ? 'VENCIDA' : 'BLOQUEADA'}
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Top row: chip + network */}
          <View style={styles.topRow}>
            <View style={styles.chip} />
            <Text style={styles.networkLabel}>{NETWORK_LABEL[card.network]}</Text>
          </View>

          {/* Card number */}
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>

          {/* Bottom row: holder + expiry */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.cardFieldLabel}>Titular</Text>
              <Text style={styles.cardFieldValue} numberOfLines={1}>
                {card.holderName.toUpperCase()}
              </Text>
            </View>
            <View style={styles.expiryBlock}>
              <Text style={styles.cardFieldLabel}>Vence</Text>
              <Text style={styles.cardFieldValue}>{card.expiryDate}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimStyle]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: gradient.bottom }]} />
        <View style={styles.magneticStripe} />
        <View style={styles.signaturePanel}>
          <Text style={styles.signatureLine} />
          <Text style={styles.cvvLabel}>CVV</Text>
          <Text style={styles.cvvValue}>{card.cvv ?? '•••'}</Text>
        </View>
        <Text style={styles.backNetwork}>{NETWORK_LABEL[card.network]}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CARD_WIDTH = 320;
const CARD_HEIGHT = Math.round(CARD_WIDTH / CARD_RATIO);

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    }),
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  gradientBottom: {
    opacity: 0.7,
    top: '50%',
  },
  circleA: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  circleB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },
  blockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: SPACING.xs,
  },
  blockedText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    letterSpacing: 3,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#D4A843',
    borderWidth: 1,
    borderColor: '#B8912E',
  },
  networkLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold as any,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  cardNumber: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    letterSpacing: 3,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  expiryBlock: {
    alignItems: 'flex-end',
  },
  cardFieldLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xxxs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardFieldValue: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    letterSpacing: 1,
  },
  // Back face
  magneticStripe: {
    width: '100%',
    height: 44,
    backgroundColor: COLORS.black,
    marginTop: SPACING.xl,
  },
  signaturePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  signatureLine: {
    flex: 1,
  },
  cvvLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xxs,
    color: COLORS.gray600,
    marginRight: SPACING.xs,
  },
  cvvValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray900,
    letterSpacing: 2,
  },
  backNetwork: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.lg,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
});
