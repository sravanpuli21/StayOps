import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../theme';

type Audience = 'all' | 'maintenance' | 'housekeeping' | 'front_desk';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: (msg: { message: string; audience: Audience }) => void;
}

const AUDIENCES: Array<{ value: Audience; label: string; icon: string }> = [
  { value: 'all',           label: 'All staff',     icon: 'people-outline' },
  { value: 'maintenance',   label: 'Maintenance',   icon: 'construct-outline' },
  { value: 'housekeeping',  label: 'Housekeeping',  icon: 'sparkles-outline' },
  { value: 'front_desk',    label: 'Front Desk',    icon: 'person-outline' },
];

export function BroadcastModal({ visible, onClose, onSend }: Props) {
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend({ message: message.trim(), audience });
    setMessage('');
    setAudience('all');
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
            <Text style={styles.title}>Broadcast note</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>To</Text>
          <View style={styles.audienceRow}>
            {AUDIENCES.map((a) => {
              const isActive = audience === a.value;
              return (
                <TouchableOpacity
                  key={a.value}
                  style={[styles.audienceBtn, isActive && styles.audienceBtnActive]}
                  onPress={() => setAudience(a.value)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={a.icon as any} size={14} color={isActive ? C.blue : C.sub} />
                  <Text style={[styles.audienceText, isActive && styles.audienceTextActive]}>{a.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={styles.input}
            multiline
            autoFocus
            placeholder="Type your broadcast..."
            placeholderTextColor={C.hint}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
              disabled={!message.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="megaphone-outline" size={16} color="#fff" />
              <Text style={styles.sendText}>Send broadcast</Text>
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
    gap: S.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: F.lg, fontWeight: '800', color: C.text },
  closeBtn: { padding: 4 },
  label: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: S.sm },
  audienceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  audienceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: S.md, paddingVertical: S.sm,
    borderRadius: R.full,
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  audienceBtnActive: { backgroundColor: C.blueBg, borderColor: C.blue },
  audienceText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  audienceTextActive: { color: C.blue },
  input: {
    minHeight: 100,
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
  sendBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.xs,
    paddingVertical: S.md, borderRadius: R.lg,
    backgroundColor: C.blue,
  },
  sendBtnDisabled: { backgroundColor: C.hint },
  sendText: { fontSize: F.md, fontWeight: '700', color: '#fff' },
});
