'use client';

import { useState, useEffect } from 'react';
import {
  getRoomByNumber, getActiveTicketsForRoom, getInventoryForRoom,
  getAuditHistoryForRoom, getInventoryItemById, MAINTENANCE_TICKETS,
} from '@hos/shared';
import type { Room, MaintenanceTicket, RoomInventoryItem, AuditTask } from '@hos/shared';
import { PortfolioView } from './PortfolioView';
import { PropertyView } from './PropertyView';
import { RoomDetailPanel } from './RoomDetailPanel';
import { TicketDetailPanel } from './TicketDetailPanel';
import { ItemDetailPanel } from './ItemDetailPanel';

type ViewLevel = { level: 'portfolio' } | { level: 'property'; hotelId: string };

type PanelFrame =
  | { kind: 'room'; roomId: string; hotelId: string }
  | { kind: 'ticket'; ticketId: string }
  | { kind: 'item'; itemId: string };

interface OpsClientProps {
  hotelIds?: readonly string[];   // When provided, filters portfolio to this subset
  initialHotelId?: string;        // When set (single-hotel scope), open that property directly
}

export function OpsClient({ hotelIds, initialHotelId }: OpsClientProps = {}) {
  const [view, setView] = useState<ViewLevel>(
    initialHotelId ? { level: 'property', hotelId: initialHotelId } : { level: 'portfolio' },
  );
  const [panelStack, setPanelStack] = useState<PanelFrame[]>([]);

  // Follow the global hotel selection: switch directly into the property view
  // when a single hotel is chosen, back to portfolio when it's cleared.
  useEffect(() => {
    if (initialHotelId) setView({ level: 'property', hotelId: initialHotelId });
    else setView({ level: 'portfolio' });
    setPanelStack([]);
  }, [initialHotelId]);

  const activePanel = panelStack[panelStack.length - 1] ?? null;
  const prevPanel = panelStack[panelStack.length - 2] ?? null;

  const push = (frame: PanelFrame) => setPanelStack((s) => [...s, frame]);
  const pop = () => setPanelStack((s) => s.slice(0, -1));
  const closeAll = () => setPanelStack([]);

  // ── Resolve panel data ──────────────────────────────────────────────────────
  let activeRoom: Room | null = null;
  let activeTicket: MaintenanceTicket | null = null;
  let activeItem: RoomInventoryItem | null = null;
  let roomTickets: MaintenanceTicket[] = [];
  let roomInventory: RoomInventoryItem[] = [];
  let roomAuditHistory: AuditTask[] = [];

  if (activePanel?.kind === 'room') {
    activeRoom = getRoomByNumber(activePanel.hotelId, activePanel.roomId) ?? null;
    if (activeRoom) {
      roomTickets = getActiveTicketsForRoom(activePanel.hotelId, activeRoom.number);
      roomInventory = getInventoryForRoom(activePanel.hotelId, activeRoom.number);
      roomAuditHistory = getAuditHistoryForRoom(activePanel.hotelId, activeRoom.number);
    }
  } else if (activePanel?.kind === 'ticket') {
    activeTicket = MAINTENANCE_TICKETS.find((t) => t.id === activePanel.ticketId) ?? null;
  } else if (activePanel?.kind === 'item') {
    activeItem = getInventoryItemById(activePanel.itemId) ?? null;
  }

  const backLabel = prevPanel?.kind === 'room' ? `Room ${prevPanel.roomId}` : undefined;
  const onBack = panelStack.length > 1 ? pop : undefined;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleHotelClick = (hotelId: string) => {
    setView({ level: 'property', hotelId });
    closeAll();
  };

  const handleRoomClick = (room: Room) => {
    if (view.level !== 'property') return;
    push({ kind: 'room', roomId: room.number, hotelId: room.hotelId });
  };

  const handleTicketClick = (ticket: MaintenanceTicket) => {
    push({ kind: 'ticket', ticketId: ticket.id });
  };

  const handleItemClick = (item: RoomInventoryItem) => {
    push({ kind: 'item', itemId: item.id });
  };

  return (
    <div className="relative">
      {view.level === 'portfolio' ? (
        <PortfolioView onHotelClick={handleHotelClick} onTicketClick={handleTicketClick} hotelIds={hotelIds} />
      ) : (
        <PropertyView
          hotelId={view.hotelId}
          onBack={() => { setView({ level: 'portfolio' }); closeAll(); }}
          onRoomClick={handleRoomClick}
          onTicketClick={handleTicketClick}
        />
      )}

      <RoomDetailPanel
        room={activePanel?.kind === 'room' ? activeRoom : null}
        tickets={roomTickets}
        inventory={roomInventory}
        auditHistory={roomAuditHistory}
        onClose={closeAll}
        onTicketClick={handleTicketClick}
        onItemClick={handleItemClick}
      />
      <TicketDetailPanel
        ticket={activePanel?.kind === 'ticket' ? activeTicket : null}
        onClose={closeAll}
        backLabel={backLabel}
        onBack={onBack}
      />
      <ItemDetailPanel
        item={activePanel?.kind === 'item' ? activeItem : null}
        onClose={closeAll}
        backLabel={backLabel}
        onBack={onBack}
      />
    </div>
  );
}
