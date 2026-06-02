import { SchedulingBoard } from '@/components/scheduling/SchedulingBoard';

export default function EmmaSchedulingPage() {
  // Employee profile links resolve under Rishab's route (the only place the
  // employee detail page lives); the board itself renders inside Emma's shell.
  return <SchedulingBoard employeeHrefBase="/web/rishab/employee" />;
}
