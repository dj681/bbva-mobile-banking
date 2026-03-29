import React, { useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';
import { Button } from './Button';

type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
type ModalAnimation = 'slide' | 'center';

interface ModalFooterButton {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  animation?: ModalAnimation;
  dismissOnBackdrop?: boolean;
  confirmButton?: ModalFooterButton;
  cancelButton?: ModalFooterButton;
  hideCloseButton?: boolean;
  contentStyle?: ViewStyle;
}

const SIZE_HEIGHTS: Record<ModalSize, string | number> = {
  small: '35%',
  medium: '55%',
  large: '80%',
  fullscreen: '100%',
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  animation = 'slide',
  dismissOnBackdrop = true,
  confirmButton,
  cancelButton,
  hideCloseButton = false,
  contentStyle,
}) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      if (animation === 'slide') {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, damping: 20, mass: 0.9, stiffness: 200, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, damping: 20, useNativeDriver: true }),
        ]).start();
      }
    } else {
      if (animation === 'slide') {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [visible, animation, fadeAnim, slideAnim, scaleAnim]);

  const hasFooter = confirmButton || cancelButton;

  const containerAnimStyle =
    animation === 'slide'
      ? [
          styles.slideContainer,
          size === 'fullscreen' ? styles.fullscreenContainer : ({ maxHeight: SIZE_HEIGHTS[size] } as ViewStyle),
          { transform: [{ translateY: slideAnim }] },
        ]
      : [
          styles.centerContainer,
          { maxHeight: SIZE_HEIGHTS[size] },
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnBackdrop ? onClose : undefined}
            accessibilityLabel="Cerrar modal"
          />
        </Animated.View>

        <Animated.View style={[...containerAnimStyle, contentStyle] as ViewStyle[]}>
          {(title || !hideCloseButton) && (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {title ?? ''}
              </Text>
              {!hideCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Cerrar"
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color={COLORS.gray600} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {hasFooter && (
            <View style={styles.footer}>
              {cancelButton && (
                <Button
                  variant="outline"
                  label={cancelButton.label}
                  onPress={cancelButton.onPress}
                  loading={cancelButton.loading}
                  disabled={cancelButton.disabled}
                  style={styles.footerButton}
                />
              )}
              {confirmButton && (
                <Button
                  variant="primary"
                  label={confirmButton.label}
                  onPress={confirmButton.onPress}
                  loading={confirmButton.loading}
                  disabled={confirmButton.disabled}
                  style={styles.footerButton}
                />
              )}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: COLORS.overlay,
  },
  slideContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingTop: SPACING.sm,
    width: '100%',
  },
  fullscreenContainer: {
    flex: 1,
    borderRadius: 0,
    maxHeight: '100%',
  },
  centerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginVertical: 'auto',
    width: '90%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    flex: 1,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold as any,
    color: COLORS.gray900,
    marginRight: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.xxs,
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerButton: {
    flex: 1,
  },
});
