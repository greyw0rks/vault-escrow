type Task = () => Promise<void>;

export class AsyncQueue {
  private queue: Task[] = [];
  private running = false;

  enqueue(task: Task): void {
    this.queue.push(task);
    if (!this.running) this.drain();
  }

  private async drain(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try { await task(); } catch (e) { console.error('[VaultSTX queue]', e); }
    }
    this.running = false;
  }

  get size(): number { return this.queue.length; }
  get busy(): boolean { return this.running; }
}

export const contractQueue = new AsyncQueue();
