import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZE, FONT_FAMILY, FONT_WEIGHT } from '@/constants';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  imageUri?: string;
  name?: string;
  size?: AvatarSize;
  showOnlineIndicator?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  small: 32,
  medium: 44,
  large: 60,
  xlarge: 80,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  small: FONT_SIZE.xs,
  medium: FONT_SIZE.base,
  large: FONT_SIZE.xl,
  xlarge: FONT_SIZE.xxl,
};

const INDICATOR_SIZE_MAP: Record<AvatarSize, number> = {
  small: 8,
  medium: 10,
  large: 14,
  xlarge: 18,
};

const PALETTE = [
  '#003366', '#00A8E8', '#4CAF50', '#FF9800',
  '#9C27B0', '#F44336', '#009688', '#3F51B5',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  name,
  size = 'medium',
  showOnlineIndicator = false,
  backgroundColor,
  style,
}) => {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const indicatorSize = INDICATOR_SIZE_MAP[size];
  const initials = name ? getInitials(name) : '?';
  const bgColor = backgroundColor ?? (name ? getColorFromName(name) : COLORS.gray400);

  const avatarStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: bgColor,
  };

  const indicatorOffset = dimension * 0.05;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.avatar, avatarStyle]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
            accessibilityLabel={name ?? 'User avatar'}
          />
        ) : (
          <Text
            style={[styles.initials, { fontSize }]}
            accessibilityLabel={name ?? 'Avatar'}
          >
            {initials}
          </Text>
        )}
      </View>
      {showOnlineIndicator && (
        <View
          style={[
            styles.indicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              bottom: indicatorOffset,
              right: indicatorOffset,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  indicator: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
