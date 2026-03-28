import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_FAMILY } from '@/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;
  autoFocus?: boolean;
  style?: ViewStyle;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
  debounceMs = 300,
  autoFocus = false,
  style,
  onFocus,
  onBlur,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingText = useRef<string>('');

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [widthAnim]);

  const handleChangeText = useCallback(
    (text: string) => {
      pendingText.current = text;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onChangeText(pendingText.current);
      }, debounceMs);
    },
    [onChangeText, debounceMs],
  );

  const handleClear = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const handleFocus = () => {
    isFocused.current = true;
    onFocus?.();
  };

  const handleBlur = () => {
    isFocused.current = false;
    onBlur?.();
  };

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['80%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { width: animatedWidth }, style]}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search-outline"
          size={18}
          color={COLORS.gray500}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          defaultValue={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search input"
          accessibilityRole="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray900,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    padding: 2,
  },
});
