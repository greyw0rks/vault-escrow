'use client';
import { useParams } from 'next/navigation';
import { useEscrow } from './useEscrow';

export function useEscrowById() {
  const { id } = useParams<{ id: string }>();
  const escrowId = id ? Number(id) : null;
  return { ...useEscrow(escrowId), escrowId };
}
