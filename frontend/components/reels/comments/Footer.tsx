import React, { useCallback, useState } from 'react';
import { StyleSheet, Image, TextInput, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TouchableOpacity from '@/components/TouchableOpacity';

interface FooterProps {
  onSend: (text: string) => void;
}

// Owns its own text state so the BottomSheetModal's footerComponent stays stable
export const Footer = React.memo(function Footer({ onSend }: FooterProps) {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }, [text, onSend]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.inputBar}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/150?img=50' }}
        style={styles.inputAvatar}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a comment…"
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={300}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim()}
        style={styles.sendButton}
      >
        <Text style={[styles.sendText, text.trim() ? styles.sendTextActive : null]}>
          Post
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    backgroundColor: '#1c1c1e',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 14,
  },
  sendTextActive: {
    color: '#3b82f6',
  },
});
