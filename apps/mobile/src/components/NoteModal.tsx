import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../theme';

interface Props {
  visible: boolean;
  title?: string;
  initialValue?: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export function NoteModal({ visible, title = 'Add a note', initialValue = '', onClose, onSave }: Props) {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (visible) setText(initialValue);
  }, [visible, initialValue]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            multiline
            autoFocus
            placeholder="Type your note..."
            placeholderTextColor={C.hint}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, !text.trim() && styles.saveBtnDisabled]}
              disabled={!text.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveText}>Save note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: S.xl,
    gap: S.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: F.lg, fontWeight: '800', color: C.text },
  closeBtn: { padding: 4 },
  input: {
    minHeight: 120,
    backgroundColor: C.input,
    borderRadius: R.lg,
    padding: S.md,
    fontSize: F.md,
    color: C.text,
  },
  footer: { flexDirection: 'row', gap: S.sm, marginTop: S.sm },
  cancelBtn: {
    flex: 1, paddingVertical: S.md, borderRadius: R.lg,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.input,
  },
  cancelText: { fontSize: F.md, fontWeight: '700', color: C.sub },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.xs,
    paddingVertical: S.md, borderRadius: R.lg,
    backgroundColor: C.brand,
  },
  saveBtnDisabled: { backgroundColor: C.hint },
  saveText: { fontSize: F.md, fontWeight: '700', color: '#fff' },
});
