-- 0019_ticket_items.sql
-- Multi-item support for front-desk requests. Each ticket can now carry
-- an items array, e.g.
--   Work Order:        [{ area: 'Bathroom',  item: 'Toilet'      }, ...]
--   Service Request:   [{ category: 'Towels', item: 'Bath Towel', quantity: 3 }, ...]
-- Existing tickets stay valid (column is nullable).

alter table maintenance_tickets
  add column if not exists items jsonb;
