import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const client = accounts.get("wallet_1")!;
const worker = accounts.get("wallet_2")!;
const resolver = accounts.get("wallet_3")!;
const stranger = accounts.get("wallet_4")!;

const C = "vaultstx-escrow";
const DEPOSIT = 3_000_000;
const MS_AMOUNT = 1_500_000;

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_STATE = 102;

const contractAddress = () => `${accounts.get("deployer")!}.${C}`;
const stxOf = (who: string) => simnet.getAssetsMap().get("STX")!.get(who) ?? 0n;

/** Two-milestone escrow, activated, first milestone submitted and disputed. */
function escrowInDispute() {
  simnet.callPublicFn(C, "create-escrow",
    [Cl.principal(worker), Cl.principal(resolver), Cl.uint(DEPOSIT)], client);
  simnet.callPublicFn(C, "add-milestone",
    [Cl.uint(1), Cl.stringAscii("first half"), Cl.uint(MS_AMOUNT)], client);
  simnet.callPublicFn(C, "add-milestone",
    [Cl.uint(1), Cl.stringAscii("second half"), Cl.uint(MS_AMOUNT)], client);
  simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], client);
  simnet.callPublicFn(C, "submit-milestone", [Cl.uint(1), Cl.uint(0)], worker);
  simnet.callPublicFn(C, "raise-dispute", [Cl.uint(1), Cl.uint(0)], client);
}

const escrowField = (field: string) => {
  const { result } = simnet.callReadOnlyFn(C, "get-escrow", [Cl.uint(1)], client);
  // (optional (tuple ...)) — booleans live in the type, uints in the value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result as any).value.value[field];
};

describe("vaultstx-escrow: disputes", () => {
  beforeEach(() => { escrowInDispute(); });

  it("puts the escrow and the milestone into the disputed state", () => {
    expect(escrowField("state")).toBeUint(2); // STATE-DISPUTED
    const { result } = simnet.callReadOnlyFn(C, "get-milestone", [Cl.uint(1), Cl.uint(0)], client);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).value.value.state).toBeUint(3); // MS-DISPUTED
  });

  it("only the resolver can settle it", () => {
    expect(simnet.callPublicFn(C, "resolve-dispute",
      [Cl.uint(1), Cl.uint(0), Cl.bool(true)], client).result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
    expect(simnet.callPublicFn(C, "resolve-dispute",
      [Cl.uint(1), Cl.uint(0), Cl.bool(true)], stranger).result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
  });

  it("releasing to the worker pays the worker and re-activates the escrow", () => {
    const before = stxOf(worker);
    const { result } = simnet.callPublicFn(C, "resolve-dispute",
      [Cl.uint(1), Cl.uint(0), Cl.bool(true)], resolver);
    expect(result).toBeOk(Cl.bool(true));
    expect(stxOf(worker) - before).toBe(BigInt(MS_AMOUNT));
    expect(escrowField("state")).toBeUint(1);            // back to STATE-ACTIVE
    expect(escrowField("active-milestone")).toBeUint(1); // moved to the next one
    expect(escrowField("released")).toBeUint(MS_AMOUNT);
  });

  it("refunding sends the milestone amount back to the client", () => {
    const before = stxOf(client);
    const { result } = simnet.callPublicFn(C, "resolve-dispute",
      [Cl.uint(1), Cl.uint(0), Cl.bool(false)], resolver);
    expect(result).toBeOk(Cl.bool(false));
    expect(stxOf(client) - before).toBe(BigInt(MS_AMOUNT));
  });

  it("cannot be settled twice", () => {
    simnet.callPublicFn(C, "resolve-dispute", [Cl.uint(1), Cl.uint(0), Cl.bool(true)], resolver);
    expect(simnet.callPublicFn(C, "resolve-dispute",
      [Cl.uint(1), Cl.uint(0), Cl.bool(true)], resolver).result).toBeErr(Cl.uint(ERR_INVALID_STATE));
  });

  it("blocks approval while the escrow is disputed", () => {
    expect(simnet.callPublicFn(C, "approve-milestone",
      [Cl.uint(1), Cl.uint(0)], client).result).toBeErr(Cl.uint(ERR_INVALID_STATE));
  });

  it("settling the last milestone completes the escrow", () => {
    simnet.callPublicFn(C, "resolve-dispute", [Cl.uint(1), Cl.uint(0), Cl.bool(true)], resolver);
    simnet.callPublicFn(C, "submit-milestone", [Cl.uint(1), Cl.uint(1)], worker);
    simnet.callPublicFn(C, "approve-milestone", [Cl.uint(1), Cl.uint(1)], client);
    expect(escrowField("state")).toBeUint(3); // STATE-COMPLETE
    expect(escrowField("released")).toBeUint(DEPOSIT);
  });

  it("leaves nothing behind in the contract once complete", () => {
    simnet.callPublicFn(C, "resolve-dispute", [Cl.uint(1), Cl.uint(0), Cl.bool(true)], resolver);
    simnet.callPublicFn(C, "submit-milestone", [Cl.uint(1), Cl.uint(1)], worker);
    simnet.callPublicFn(C, "approve-milestone", [Cl.uint(1), Cl.uint(1)], client);
    expect(stxOf(contractAddress())).toBe(0n);
  });
});

describe("vaultstx-escrow: dispute guards", () => {
  it("a stranger cannot raise a dispute", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(worker), Cl.principal(resolver), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("only step"), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], client);
    simnet.callPublicFn(C, "submit-milestone", [Cl.uint(1), Cl.uint(0)], worker);
    expect(simnet.callPublicFn(C, "raise-dispute",
      [Cl.uint(1), Cl.uint(0)], stranger).result).toBeErr(Cl.uint(ERR_NOT_AUTHORIZED));
  });

  it("a pending milestone cannot be disputed", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(worker), Cl.principal(resolver), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("only step"), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], client);
    expect(simnet.callPublicFn(C, "raise-dispute",
      [Cl.uint(1), Cl.uint(0)], client).result).toBeErr(Cl.uint(ERR_INVALID_STATE));
  });

  it("cancel is refused once the escrow is active", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(worker), Cl.principal(resolver), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("only step"), Cl.uint(DEPOSIT)], client);
    simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], client);
    expect(simnet.callPublicFn(C, "cancel-escrow",
      [Cl.uint(1)], client).result).toBeErr(Cl.uint(ERR_INVALID_STATE));
  });
});
