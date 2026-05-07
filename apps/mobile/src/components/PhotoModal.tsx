import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (label: string) => void;
}

// Mock "camera roll" — each tile represents a pre-captured photo a user might attach
const MOCK_PHOTOS = [
  { label: 'PTAC unit front panel',    icon: 'snow-outline',     bg: C.blueBg,   color: C.blue },
  { label: 'Thermostat reading',       icon: 'thermometer-outline', bg: C.redBg,  color: C.red },
  { label: 'Capacitor close-up',       icon: 'hardware-chip-outline', bg: C.purpleBg, color: C.purple },
  { label: 'Room temperature panel',   icon: 'speedometer-outline', bg: C.amberBg, color: C.amber },
  { label: 'Water damage / leak',      icon: 'water-outline',    bg: C.blueBg,   color: C.blue },
  { label: 'Fixture overview',         icon: 'bulb-outline',     bg: C.greenBg,  color: C.green },
] as const;

export function PhotoModal({ visible, onClose, onPick }: Props) {
  const handleCapture = () => {
    // In production this would open the camera; for demo we pick a random mock
    const choice = MOCK_PHOTOS[Math.floor(Math.random() * MOCK_PHOTOS.length)];
    onPick(choice.label);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Attach a photo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.captureText}>Take new photo</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Or pick from recent evidence</Text>

          <View style={styles.grid}>
            {MOCK_PHOTOS.map((photo) => (
              <TouchableOpacity
                key={photo.label}
                style={[styles.tile, { backgroundColor: photo.bg }]}
                onPress={() => {
                  onPick(photo.label);
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name={photo.icon as any} size={28} color={photo.color} />
                <Text style={[styles.tileLabel, { color: photo.color }]} numberOfLines={2}>
                  {photo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
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
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.sm,
    paddingVertical: S.md, borderRadius: R.lg,
    backgroundColor: C.brand,
  },
  captureText: { fontSize: F.md, fontWeight: '700', color: '#fff' },
  hint: { fontSize: F.sm, color: C.hint, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  tile: {
    width: '48%',
    alignItems: 'center',
    gap: S.xs,
    paddingVertical: S.lg, paddingHorizontal: S.sm,
    borderRadius: R.lg,
  },
  tileLabel: { fontSize: F.xs, fontWeight: '700', textAlign: 'center' },
});
