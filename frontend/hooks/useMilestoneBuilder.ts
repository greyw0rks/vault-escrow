import { useState } from 'react';

interface MilestoneEntry { description: string; amount: string; }

export function useMilestoneBuilder() {
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);

  const add = (description: string, amount: string) =>
    setMilestones(ms => [...ms, { description, amount }]);

  const remove = (index: number) =>
    setMilestones(ms => ms.filter((_, i) => i !== index));

  const update = (index: number, field: keyof MilestoneEntry, value: string) =>
    setMilestones(ms => ms.map((m, i) => i === index ? { ...m, [field]: value } : m));

  const clear = () => setMilestones([]);

  const total = milestones.reduce((acc, m) => acc + parseFloat(m.amount || '0'), 0);

  return { milestones, add, remove, update, clear, total };
}
