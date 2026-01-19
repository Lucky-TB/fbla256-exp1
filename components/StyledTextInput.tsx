import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

/**
 * Styled TextInput component with Apercu Pro font
 */
export function StyledTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.default, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'ApercuPro-Regular',
  },
});
