'use client';

import { useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { buildCreateEscrow, buildAddMilestone, buildActivateEscrow, stxToMicro } from '@/lib/contract';
import { useRouter } from 'next/navigation';

type Step = 'parties' | 'milestones' | 'review' | 'done';

interface MilestoneInput {
  description: string;
  amount: string;
}

export default function NewEscrowPage() {
  const { doContractCall } = useConnect();
  const router = useRouter();

  const [step, setStep]       = useState<Step>('parties');
  const [worker, setWorker]   = useState('');
  const [resolver, setResolver] = useState('');
  const [deposit, setDeposit] = useState('');
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: '', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  function addMilestoneRow() {
    setMilestones([...milestones, { description: '', amount: '' }]);
  }

  function updateMilestone(idx: number, field: keyof MilestoneInput, value: string) {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setMilestones(updated);
  }

  function removeMilestone(idx: number) {
    setMilestones(milestones.filter((_, i) => i !== idx));
  }

  async function handleCreateEscrow() {
    setLoading(true);
    setError('');
    try {
      await doContractCall({
        ...buildCreateEscrow(worker, resolver, stxToMicro(deposit)),
        onFinish: (data) => {
          // In real flow, we'd get the escrow ID from tx result
          // For now advance to milestone step
          setStep('milestones');
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  async function handleAddMilestones() {
    if (!escrowId) return;
    setLoading(true);
    try {
      for (const [i, ms] of milestones.entries()) {
        await doContractCall({
          ...buildAddMilestone(escrowId, ms.description, stxToMicro(ms.amount)),
          onFinish: () => {},
          onCancel: () => {},
        });
      }
      setStep('review');
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  async function handleActivate() {
    if (!escrowId) return;
    setLoading(true);
    try {
      await doContractCall({
        ...buildActivateEscrow(escrowId),
        onFinish: () => {
          setStep('done');
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <div className="form-card">
        {/* Progress */}
        <div className="progress-bar">
          {(['parties', 'milestones', 'review', 'done'] as Step[]).map((s, i) => (
            <div key={s} className={`progress-step ${step === s ? 'active' : ''} ${
              ['parties', 'milestones', 'review', 'done'].indexOf(step) > i ? 'done' : ''
            }`}>
              <div className="progress-dot">{i + 1}</div>
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Step 1: Parties */}
        {step === 'parties' && (
          <div className="form-section">
            <h2>Set up escrow parties</h2>
            <p className="form-hint">Enter the Stacks addresses for the worker and resolver.</p>

            <label>Worker address</label>
            <input
              placeholder="SP2J6ZY48GV..."
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
            />

            <label>Resolver address</label>
            <input
              placeholder="SP3FBR2AGK5..."
              value={resolver}
              onChange={(e) => setResolver(e.target.value)}
            />

            <label>Initial deposit (STX)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="100"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
            <p className="form-hint muted">Deposit can be topped up when you activate.</p>

            <button
              className="btn-primary btn-full"
              onClick={handleCreateEscrow}
              disabled={!worker || !resolver || !deposit || loading}
            >
              {loading ? 'Confirming…' : 'Create Escrow →'}
            </button>
          </div>
        )}

        {/* Step 2: Milestones */}
        {step === 'milestones' && (
          <div className="form-section">
            <h2>Define milestones</h2>
            <p className="form-hint">Break the work into deliverables. STX releases per milestone approval.</p>

            {milestones.map((ms, i) => (
              <div key={i} className="milestone-row">
                <div className="ms-num">{i + 1}</div>
                <div className="ms-fields">
                  <input
                    placeholder="Describe the deliverable…"
                    value={ms.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                  />
                  <div className="ms-amount-row">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="STX amount"
                      value={ms.amount}
                      onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                    />
                    <button className="btn-danger-sm" onClick={() => removeMilestone(i)}>×</button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-ghost btn-sm" onClick={addMilestoneRow}>
              + Add milestone
            </button>

            <div className="total-row">
              <span>Total</span>
              <strong>{totalAmount.toFixed(2)} STX</strong>
            </div>

            <button
              className="btn-primary btn-full"
              onClick={handleAddMilestones}
              disabled={milestones.some((m) => !m.description || !m.amount) || loading}
            >
              {loading ? 'Saving…' : 'Add Milestones →'}
            </button>
          </div>
        )}

        {/* Step 3: Review + Activate */}
        {step === 'review' && (
          <div className="form-section">
            <h2>Review & activate</h2>
            <p className="form-hint">Once activated, STX is locked until milestones complete.</p>

            <div className="review-table">
              <div className="review-row"><span>Worker</span><code>{worker.slice(0,8)}…{worker.slice(-4)}</code></div>
              <div className="review-row"><span>Resolver</span><code>{resolver.slice(0,8)}…{resolver.slice(-4)}</code></div>
              <div className="review-row"><span>Milestones</span><strong>{milestones.length}</strong></div>
              <div className="review-row"><span>Total locked</span><strong>{totalAmount.toFixed(2)} STX</strong></div>
            </div>

            <button
              className="btn-primary btn-full"
              onClick={handleActivate}
              disabled={loading}
            >
              {loading ? 'Activating…' : 'Activate Escrow 🔒'}
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="form-section center">
            <div className="success-icon">✓</div>
            <h2>Escrow is live</h2>
            <p>Your STX is locked and the worker can begin submitting milestones.</p>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
