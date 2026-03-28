import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

type PaddingVariant = 'none' | 'small' | 'medium' | 'large';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: PaddingVariant;
  backgroundColor?: string;
  style?: ViewStyle;
  header?: CardHeaderProps;
  elevation?: number;
  borderRadius?: number;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  padding = 'medium',
  backgroundColor = COLORS.white,
  style,
  header,
  elevation = 2,
  borderRadius = BORDER_RADIUS.lg,
  testID,
}) => {
  const cardStyle: ViewStyle[] = [
    styles.card,
    { backgroundColor, borderRadius },
    Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.08 + elevation * 0.02,
          shadowRadius: elevation * 2,
          shadowOffset: { width: 0, height: elevation },
        }
      : { elevation },
    styles[`padding_${padding}`],
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const content = (
    <>
      {header && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {header.title}
            </Text>
            {header.subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {header.subtitle}
              </Text>
            )}
          </View>
          {header.rightElement && (
            <View style={styles.headerRight}>{header.rightElement}</View>
          )}
        </View>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    overflow: 'hidden',
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: SPACING.sm,
  },
  padding_medium: {
    padding: SPACING.md,
  },
  padding_large: {
    padding: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold as any,
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: SPACING.sm,
  },
});
