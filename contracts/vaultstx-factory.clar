;; vaultstx-factory
;; Factory registry for VaultSTX escrow instances
;; Tracks all deployed escrows per user, provides lookup and enumeration
;; Each "escrow" in this contract is a self-contained escrow record
;; (on-chain factory pattern without dynamic contract deployment)

;; ============================================================
;; Constants
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))
(define-constant ERR-INVALID-MILESTONE (err u102))
(define-constant ERR-ESCROW-NOT-FOUND (err u103))
(define-constant ERR-WRONG-STATE (err u104))
(define-constant ERR-NOT-PARTICIPANT (err u105))
(define-constant ERR-MILESTONE-COMPLETE (err u106))
(define-constant ERR-INSUFFICIENT-FUNDS (err u107))
(define-constant ERR-MAX-ESCROWS (err u108))

;; Max escrows per user to bound map size
(define-constant MAX-ESCROWS-PER-USER u50)
;; Max milestones per escrow
(define-constant MAX-MILESTONES u10)

;; Escrow states
(define-constant STATE-ACTIVE u1)
(define-constant STATE-COMPLETED u2)
(define-constant STATE-CANCELLED u3)
(define-constant STATE-DISPUTED u4)

;; ============================================================
;; Data Vars
;; ============================================================

(define-data-var next-escrow-id uint u1)
(define-data-var total-escrows uint u0)
(define-data-var total-volume uint u0)  ;; total uSTX ever escrowed

;; ============================================================
;; Data Maps
;; ============================================================

;; escrow-id -> escrow record
(define-map escrows
  uint
  {
    client: principal,
    provider: principal,
    total-amount: uint,
    released-amount: uint,
    milestones: uint,        ;; number of milestones
    completed-milestones: uint,
    state: uint,
    created-at: uint,        ;; burn block
    description: (string-utf8 128)
  }
)

;; {escrow-id, milestone-index} -> milestone record
(define-map milestones
  { escrow-id: uint, index: uint }
  {
    amount: uint,
    released: bool,
    approved-by-client: bool,
    description: (string-utf8 64)
  }
)

;; client -> list of escrow ids (tracked as count for on-chain lookup)
(define-map client-escrow-count principal uint)
;; provider -> escrow count
(define-map provider-escrow-count principal uint)

;; escrow-id -> STX balance held in this contract for that escrow
(define-map escrow-balances uint uint)

;; ============================================================
;; Read-Only Functions
;; ============================================================

(define-read-only (get-escrow (escrow-id uint))
  (map-get? escrows escrow-id)
)

(define-read-only (get-milestone (escrow-id uint) (index uint))
  (map-get? milestones { escrow-id: escrow-id, index: index })
)

(define-read-only (get-escrow-balance (escrow-id uint))
  (default-to u0 (map-get? escrow-balances escrow-id))
)

(define-read-only (get-client-escrow-count (client principal))
  (default-to u0 (map-get? client-escrow-count client))
)

(define-read-only (get-provider-escrow-count (provider principal))
  (default-to u0 (map-get? provider-escrow-count provider))
)

(define-read-only (get-total-escrows)
  (var-get total-escrows)
)

(define-read-only (get-total-volume)
  (var-get total-volume)
)

(define-read-only (get-next-escrow-id)
  (var-get next-escrow-id)
)

;; ============================================================
;; Public Functions
;; ============================================================

;; Create a new escrow with milestones
;; Client calls this and funds the full amount upfront
(define-public (create-escrow
  (provider principal)
  (total-amount uint)
  (num-milestones uint)
  (description (string-utf8 128))
)
  (let (
    (escrow-id (var-get next-escrow-id))
    (client tx-sender)
    (client-count (get-client-escrow-count tx-sender))
  )
    (asserts! (> total-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (and (> num-milestones u0) (<= num-milestones MAX-MILESTONES)) ERR-INVALID-MILESTONE)
    (asserts! (not (is-eq client provider)) ERR-NOT-AUTHORIZED)
    (asserts! (< client-count MAX-ESCROWS-PER-USER) ERR-MAX-ESCROWS)

    ;; Transfer STX from client to this contract
    (try! (stx-transfer? total-amount client (as-contract tx-sender)))

    ;; Store escrow record
    (map-set escrows escrow-id {
      client: client,
      provider: provider,
      total-amount: total-amount,
      released-amount: u0,
      milestones: num-milestones,
      completed-milestones: u0,
      state: STATE-ACTIVE,
      created-at: burn-block-height,
      description: description
    })

    ;; Record balance
    (map-set escrow-balances escrow-id total-amount)

    ;; Update counters
    (var-set next-escrow-id (+ escrow-id u1))
    (var-set total-escrows (+ (var-get total-escrows) u1))
    (var-set total-volume (+ (var-get total-volume) total-amount))
    (map-set client-escrow-count client (+ client-count u1))
    (map-set provider-escrow-count provider (+ (get-provider-escrow-count provider) u1))

    (ok escrow-id)
  )
)

;; Set milestone details (client only, before any release)
(define-public (set-milestone
  (escrow-id uint)
  (index uint)
  (amount uint)
  (description (string-utf8 64))
)
  (let (
    (escrow (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-WRONG-STATE)
    (asserts! (< index (get milestones escrow)) ERR-INVALID-MILESTONE)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    (map-set milestones { escrow-id: escrow-id, index: index } {
      amount: amount,
      released: false,
      approved-by-client: false,
      description: description
    })

    (ok true)
  )
)

;; Client approves a milestone for release
(define-public (approve-milestone (escrow-id uint) (index uint))
  (let (
    (escrow (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-INVALID-MILESTONE))
  )
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-WRONG-STATE)
    (asserts! (not (get released milestone)) ERR-MILESTONE-COMPLETE)

    (map-set milestones { escrow-id: escrow-id, index: index }
      (merge milestone { approved-by-client: true })
    )

    (ok true)
  )
)

;; Release milestone payment to provider (after client approval)
(define-public (release-milestone (escrow-id uint) (index uint))
  (let (
    (escrow (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-INVALID-MILESTONE))
    (milestone-amount (get amount milestone))
    (current-balance (get-escrow-balance escrow-id))
  )
    ;; Only client can trigger release
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-WRONG-STATE)
    (asserts! (get approved-by-client milestone) ERR-NOT-AUTHORIZED)
    (asserts! (not (get released milestone)) ERR-MILESTONE-COMPLETE)
    (asserts! (>= current-balance milestone-amount) ERR-INSUFFICIENT-FUNDS)

    ;; Transfer to provider
    (try! (as-contract (stx-transfer? milestone-amount tx-sender (get provider escrow))))

    ;; Update milestone
    (map-set milestones { escrow-id: escrow-id, index: index }
      (merge milestone { released: true })
    )

    ;; Update escrow
    (let (
      (new-released (+ (get released-amount escrow) milestone-amount))
      (new-completed (+ (get completed-milestones escrow) u1))
      (new-balance (- current-balance milestone-amount))
      (all-done (>= new-completed (get milestones escrow)))
    )
      (map-set escrow-balances escrow-id new-balance)
      (map-set escrows escrow-id
        (merge escrow {
          released-amount: new-released,
          completed-milestones: new-completed,
          state: (if all-done STATE-COMPLETED STATE-ACTIVE)
        })
      )
    )

    (ok true)
  )
)

;; Cancel escrow and refund remaining balance to client
(define-public (cancel-escrow (escrow-id uint))
  (let (
    (escrow (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND))
    (current-balance (get-escrow-balance escrow-id))
  )
    ;; Only client can cancel
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-WRONG-STATE)

    ;; Refund remaining balance
    (if (> current-balance u0)
      (try! (as-contract (stx-transfer? current-balance tx-sender (get client escrow))))
      true
    )

    (map-set escrow-balances escrow-id u0)
    (map-set escrows escrow-id
      (merge escrow { state: STATE-CANCELLED })
    )

    (ok true)
  )
)
