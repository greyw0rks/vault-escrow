const GATEWAY = 'https://cloudflare-ipfs.com/ipfs';

export function ipfsUrl(cid: string): string {
  if (!cid) return '';
  if (cid.startsWith('http')) return cid;
  return GATEWAY + '/' + cid.replace('ipfs://', '');
}

export function isIpfsCid(value: string): boolean {
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z2-7]{56})/.test(value);
}
