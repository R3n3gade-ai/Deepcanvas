import React from 'react';
import { ConnectionManager } from '../components/ConnectionManager';
import { useUserGuardContext } from "app";

export default function Connections() {
  const { user } = useUserGuardContext();

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <ConnectionManager />
    </main>
  );
}
