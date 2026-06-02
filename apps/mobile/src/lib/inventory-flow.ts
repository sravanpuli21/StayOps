/**
 * Shared "Did you use any item?" flow.
 *
 * Used by:
 *   - Audit failed-item action sheet (Use inventory item)
 *   - Ticket Mark Fixed flow
 *
 * Steps: ask whether item was used → which item → where from → if borrowed
 * room, prompt source room + arrival risk.
 *
 * Calls the inventory store to decrement counts on confirmation.
 */

import { Alert } from 'react-native';
import { decrementByLabel } from '../store/inventory-store';

export const INVENTORY_CHOICES = [
  { label: 'White 10W bulb',  variant: 'White 10W',         storeName: 'LED Bulb' },
  { label: 'White 5W bulb',   variant: 'White 5W',          storeName: 'LED Bulb' },
  { label: 'Warm 10W bulb',   variant: 'Warm 10W',          storeName: 'LED Bulb' },
  { label: 'TV remote',       variant: 'Spare universal',   storeName: 'TV Remote' },
  { label: 'AAA batteries',   variant: 'For remotes',       storeName: 'AAA Battery' },
  { label: 'AC filter',       variant: 'PTAC unit',         storeName: 'AC Filter' },
  { label: 'Other',           variant: '',                  storeName: '' },
];

const SOURCES = [
  'Inventory / stock',
  'Another room',
  'Vendor delivery',
  'Temporary fix',
  'Other',
];

export interface UsageResult {
  itemLabel: string;
  variant: string;
  source: string;
  sourceRoom?: string;
  followUpUrgent?: boolean;
}

/**
 * Top-level prompt: "Did you use any item?"
 * If yes, runs the chain. Calls onLogged with the result for screen-level
 * state updates (e.g. attaching the usage to a ticket or audit item).
 */
export function askDidYouUseItem(
  contextLabel: string,
  onLogged: (result: UsageResult) => void,
  onSkipped?: () => void,
) {
  Alert.alert(
    'Did you use any item?',
    contextLabel,
    [
      { text: 'No, skip',  style: 'cancel', onPress: () => onSkipped?.() },
      { text: 'Yes, log',  onPress: () => askWhatItem(contextLabel, onLogged) },
    ]
  );
}

/** Just the chained part — when caller already knows item was used. */
export function askWhatItem(
  contextLabel: string,
  onLogged: (result: UsageResult) => void,
) {
  Alert.alert(
    'What did you use?',
    contextLabel,
    [
      { text: 'Cancel', style: 'cancel' },
      ...INVENTORY_CHOICES.map((opt) => ({
        text: opt.label,
        onPress: () => askSource(opt, contextLabel, onLogged),
      })),
    ]
  );
}

function askSource(
  opt: typeof INVENTORY_CHOICES[number],
  contextLabel: string,
  onLogged: (result: UsageResult) => void,
) {
  Alert.alert(
    'Where did it come from?',
    `${opt.label}${opt.variant ? ` · ${opt.variant}` : ''}`,
    [
      { text: 'Cancel', style: 'cancel' },
      ...SOURCES.map((src) => ({
        text: src,
        onPress: () => {
          if (src === 'Another room') promptSourceRoom(opt, contextLabel, onLogged);
          else commit(opt, src, undefined, false, onLogged);
        },
      })),
    ]
  );
}

function promptSourceRoom(
  opt: typeof INVENTORY_CHOICES[number],
  contextLabel: string,
  onLogged: (result: UsageResult) => void,
) {
  Alert.alert(
    'Source room?',
    'Which room did you take this from?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Vacant 402', onPress: () => commit(opt, 'Another room', '402', false, onLogged) },
      { text: 'Vacant 410', onPress: () => commit(opt, 'Another room', '410', false, onLogged) },
      { text: 'Other (urgent — arrival today)', style: 'destructive',
        onPress: () => commit(opt, 'Another room', 'TBD', true, onLogged) },
    ]
  );
}

function commit(
  opt: typeof INVENTORY_CHOICES[number],
  source: string,
  sourceRoom: string | undefined,
  followUpUrgent: boolean,
  onLogged: (result: UsageResult) => void,
) {
  /* Decrement only when source = inventory; borrowed-from-room doesn't drop stock */
  if (source === 'Inventory / stock' && opt.storeName) {
    decrementByLabel(opt.storeName, opt.variant);
  }

  const result: UsageResult = {
    itemLabel: opt.label,
    variant:   opt.variant,
    source,
    sourceRoom,
    followUpUrgent,
  };

  /* Show outcome banner */
  if (sourceRoom) {
    Alert.alert(
      'Logged + follow-up created',
      `${opt.label} from Room ${sourceRoom}\n\nFollow-up ticket: replace ${opt.label} in Room ${sourceRoom}${followUpUrgent ? ' (URGENT — arrival today)' : ''}`
    );
  } else {
    Alert.alert(
      'Logged',
      source === 'Inventory / stock'
        ? `${opt.label} from ${source}\nInventory −1`
        : `${opt.label} from ${source}`
    );
  }

  onLogged(result);
}
