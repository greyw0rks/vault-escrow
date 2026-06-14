;; vaultstx-dispute
;; Arbitration module for VaultSTX escrow disputes
;; Either party can open a dispute; a designated arbitrator resolves it
;; Arbitrator can split funds between client and provider

;; ============================================================
;; Constants
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-DISPUTE-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-DISPUTED (err u102))
(define-constant ERR-WRONG-STATE (err u103))
(define-constant ERR-NOT-PARTICIPANT (err u104))
(define-constant ERR-INVALID-SPLIT (err u105))
(define-constant ERR-NOT-ARBITRATOR (err u106))
(define-constant ERR-ALREADY-RESOLVED (err u107))
(define-constant ERR-INVALID-AMOUNT (err u108))
(define-constant ERR-NO-ARBITRATOR (err u109))

;; Dispute states
(define-constant DISPUTE-OPEN u1)
(define-constant DISPUTE-RESOLVED u2)
(define-constant DISPUTE-WITHDRAWN u3)

;; ============================================================
;; Data Vars
;; ============================================================

(define-data-var contract-arbitrator principal CONTRACT-OWNER)
(define-data-var next-dispute-id uint u1)
(define-data-var total-disputes uint u0)
(define-data-var total-resolved uint u0)
;; Arbitration fee in uSTX (paid by losing/disputing party)
(define-data-var arbitration-fee uint u1000000)  ;; 1 STX default

;; ============================================================
;; Data Maps
;; ============================================================

;; dispute-id -> dispute record
(define-map disputes
  uint
  {
    escrow-id: uint,
    client: principal,
    provider: principal,
    opener: principal,        ;; who opened the dispute
    disputed-amount: uint,    ;; total STX in dispute
    client-claim: uint,       ;; what client says they should get
    provider-claim: uint,     ;; what provider says they should get
    reason: (string-utf8 256),
    state: uint,
    opened-at: uint,          ;; burn block
    resolved-at: uint,
    client-award: uint,
    provider-award: uint,
    resolution-notes: (string-utf8 256)
  }
)

;; escrow-id -> dispute-id (one active dispute per escrow)
(define-map escrow-dispute
  uint
  uint
)

;; ============================================================
;; Read-Only Functions
;; ============================================================

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes dispute-id)
)

(define-read-only (get-dispute-by-escrow (escrow-id uint))
  (map-get? escrow-dispute escrow-id)
)

(define-read-only (get-arbitrator)
  (var-get contract-arbitrator)
)

(define-read-only (get-arbitration-fee)
  (var-get arbitration-fee)
)

(define-read-only (get-total-disputes)
  (var-get total-disputes)
)

(define-read-only (get-total-resolved)
  (var-get total-resolved)
)

(define-read-only (has-open-dispute (escrow-id uint))
  (match (map-get? escrow-dispute escrow-id)
    dispute-id
      (match (map-get? disputes dispute-id)
        dispute (is-eq (get state dispute) DISPUTE-OPEN)
        false
      )
    false
  )
)

(define-read-only (get-next-dispute-id)
  (var-get next-dispute-id)
)

;; ============================================================
;; Public Functions
;; ============================================================

;; Open a dispute for an escrow
;; Either client or provider can open; caller pays arbitration fee
(define-public (open-dispute
  (escrow-id uint)
  (client principal)
  (provider principal)
  (disputed-amount uint)
  (client-claim uint)
  (provider-claim uint)
  (reason (string-utf8 256))
)
  (let (
    (dispute-id (var-get next-dispute-id))
    (caller tx-sender)
    (fee (var-get arbitration-fee))
  )
    ;; Caller must be client or provider
    (asserts!
      (or (is-eq caller client) (is-eq caller provider))
      ERR-NOT-PARTICIPANT
    )
    ;; No existing open dispute for this escrow
    (asserts! (not (has-open-dispute escrow-id)) ERR-ALREADY-DISPUTED)
    ;; Claims must add up to disputed amount
    (asserts! (is-eq (+ client-claim provider-claim) disputed-amount) ERR-INVALID-SPLIT)
    (asserts! (> disputed-amount u0) ERR-INVALID-AMOUNT)

    ;; Collect arbitration fee
    (try! (stx-transfer? fee caller (var-get contract-arbitrator)))

    ;; Create dispute record
    (map-set disputes dispute-id {
      escrow-id: escrow-id,
      client: client,
      provider: provider,
      opener: caller,
      disputed-amount: disputed-amount,
      client-claim: client-claim,
      provider-claim: provider-claim,
      reason: reason,
      state: DISPUTE-OPEN,
      opened-at: burn-block-height,
      resolved-at: u0,
      client-award: u0,
      provider-award: u0,
      resolution-notes: u""
    })

    ;; Link escrow -> dispute
    (map-set escrow-dispute escrow-id dispute-id)

    ;; Update counters
    (var-set next-dispute-id (+ dispute-id u1))
    (var-set total-disputes (+ (var-get total-disputes) u1))

    (ok dispute-id)
  )
)

;; Arbitrator resolves a dispute by specifying the award split
;; Arbitrator is responsible for actually transferring funds from the escrow
;; This contract records the ruling; execution happens via vaultstx-factory
(define-public (resolve-dispute
  (dispute-id uint)
  (client-award uint)
  (provider-award uint)
  (notes (string-utf8 256))
)
  (let (
    (dispute (unwrap! (map-get? disputes dispute-id) ERR-DISPUTE-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (var-get contract-arbitrator)) ERR-NOT-ARBITRATOR)
    (asserts! (is-eq (get state dispute) DISPUTE-OPEN) ERR-ALREADY-RESOLVED)
    ;; Awards must equal disputed amount
    (asserts!
      (is-eq (+ client-award provider-award) (get disputed-amount dispute))
      ERR-INVALID-SPLIT
    )

    ;; Record resolution
    (map-set disputes dispute-id
      (merge dispute {
        state: DISPUTE-RESOLVED,
        resolved-at: burn-block-height,
        client-award: client-award,
        provider-award: provider-award,
        resolution-notes: notes
      })
    )

    (var-set total-resolved (+ (var-get total-resolved) u1))

    (ok { client-award: client-award, provider-award: provider-award })
  )
)

;; Withdraw dispute (opener only, while still open)
;; Arbitration fee is non-refundable
(define-public (withdraw-dispute (dispute-id uint))
  (let (
    (dispute (unwrap! (map-get? disputes dispute-id) ERR-DISPUTE-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get opener dispute)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state dispute) DISPUTE-OPEN) ERR-ALREADY-RESOLVED)

    (map-set disputes dispute-id
      (merge dispute { state: DISPUTE-WITHDRAWN })
    )

    (ok true)
  )
)

;; ============================================================
;; Admin Functions
;; ============================================================

(define-public (set-arbitrator (new-arbitrator principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set contract-arbitrator new-arbitrator)
    (ok true)
  )
)

(define-public (set-arbitration-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set arbitration-fee new-fee)
    (ok new-fee)
  )
)
