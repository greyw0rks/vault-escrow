import { describe, it, expect } from "vitest";
import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const w1 = accounts.get("wallet_1")!;
const w2 = accounts.get("wallet_2")!;
const w3 = accounts.get("wallet_3")!;
const C = "vaultstx-escrow";

describe("vaultstx-escrow", () => {
  it("create-escrow returns ID 1", () => {
    const { result } = simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w2), Cl.principal(w3), Cl.uint(1_000_000)], w1);
    expect(result).toBeOk(Cl.uint(1));
  });

  it("add-milestone returns index 0", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w2), Cl.principal(w3), Cl.uint(2_000_000)], w1);
    const { result } = simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("Design mockups"), Cl.uint(500_000)], w1);
    expect(result).toBeOk(Cl.uint(0));
  });

  it("happy path completes escrow", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w2), Cl.principal(w3), Cl.uint(1_000_000)], w1);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("v1 delivery"), Cl.uint(1_000_000)], w1);
    simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], w1);
    simnet.callPublicFn(C, "submit-milestone", [Cl.uint(1), Cl.uint(0)], w2);
    const { result } = simnet.callPublicFn(C, "approve-milestone",
      [Cl.uint(1), Cl.uint(0)], w1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("cancel-escrow refunds client", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w2), Cl.principal(w3), Cl.uint(2_000_000)], w1);
    const { result } = simnet.callPublicFn(C, "cancel-escrow", [Cl.uint(1)], w1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("out-of-order submit fails with 102", () => {
    simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w2), Cl.principal(w3), Cl.uint(2_000_000)], w1);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("step one"), Cl.uint(1_000_000)], w1);
    simnet.callPublicFn(C, "add-milestone",
      [Cl.uint(1), Cl.stringAscii("step two"), Cl.uint(1_000_000)], w1);
    simnet.callPublicFn(C, "activate-escrow", [Cl.uint(1)], w1);
    const { result } = simnet.callPublicFn(C, "submit-milestone",
      [Cl.uint(1), Cl.uint(1)], w2);
    expect(result).toBeErr(Cl.uint(102));
  });

  it("self-escrow guard returns 104", () => {
    const { result } = simnet.callPublicFn(C, "create-escrow",
      [Cl.principal(w1), Cl.principal(w3), Cl.uint(1_000_000)], w1);
    expect(result).toBeErr(Cl.uint(104));
  });
});
