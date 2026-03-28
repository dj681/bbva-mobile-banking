import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../common/Button';

describe('Button component', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Button label="Connexion" />);
    expect(getByText('Connexion')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Submit" onPress={onPress} disabled />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Submit" onPress={onPress} loading />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows an ActivityIndicator when loading is true', () => {
    const { getByRole } = render(<Button label="Submit" loading />);
    // The button itself should have the busy accessibility state
    const btn = getByRole('button');
    expect(btn.props.accessibilityState).toMatchObject({ busy: true });
  });

  it('renders the label for each variant without crashing', () => {
    const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const;
    variants.forEach((variant) => {
      const { getByText } = render(
        <Button key={variant} label={variant} variant={variant} />,
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('renders the label for each size without crashing', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { getByText } = render(
        <Button key={size} label={size} size={size} />,
      );
      expect(getByText(size)).toBeTruthy();
    });
  });

  it('has the correct accessibility label', () => {
    const { getByRole } = render(<Button label="Se connecter" />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toBe('Se connecter');
  });

  it('renders with fullWidth without crashing', () => {
    const { getByText } = render(<Button label="Full Width" fullWidth />);
    expect(getByText('Full Width')).toBeTruthy();
  });
});
