const BASE = 'https://api.testnet.hiro.so';

export async function getAccountSTX(address: string): Promise<bigint> {
  const res = await fetch(BASE + '/v2/accounts/' + address);
  const data = await res.json();
  return BigInt(data.balance ?? 0);
}

export async function getBlockHeight(): Promise<number> {
  const res = await fetch(BASE + '/v2/info');
  const data = await res.json();
  return Number(data.stacks_tip_height ?? 0);
}

export async function getTransaction(txId: string) {
  const res = await fetch(BASE + '/extended/v1/tx/' + txId);
  if (!res.ok) return null;
  return res.json();
}
