;; VaultSTX - Trustless Milestone Escrow
;; Proof of Ship | Stacks Blockchain
;; github.com/greyw0rks/vaultstx

;; ================================
;; ERRORS
;; ================================
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND      (err u101))
(define-constant ERR-INVALID-STATE  (err u102))
(define-constant ERR-ZERO-AMOUNT    (err u103))
(define-constant ERR-SELF-ESCROW    (err u104))
(define-constant ERR-CAP-EXCEEDED   (err u105))

;; ================================
;; STATE CONSTANTS
;; ================================
(define-constant STATE-OPEN      u0)   ;; Accepting milestones
(define-constant STATE-ACTIVE    u1)   ;; Running - STX locked
(define-constant STATE-DISPUTED  u2)   ;; Awaiting resolver
(define-constant STATE-COMPLETE  u3)   ;; All milestones approved
(define-constant STATE-CANCELLED u4)   ;; Refunded

(define-constant MS-PENDING   u0)
(define-constant MS-SUBMITTED u1)
(define-constant MS-APPROVED  u2)
(define-constant MS-DISPUTED  u3)

(define-constant MAX-MILESTONES u20)

;; ================================
;; STORAGE
;; ================================
(define-data-var next-id uint u1)

(define-map escrows uint {
  client:           principal,
  worker:           principal,
  resolver:         principal,
  total-amount:     uint,
  deposited:        uint,
  released:         uint,
  milestone-count:  uint,
  active-milestone: uint,
  state:            uint,
  created-at:       uint
})

(define-map milestones { escrow-id: uint, index: uint } {
  description:    (string-ascii 200),
  amount:         uint,
  state:          uint,
  block-submitted: uint,
  block-resolved:  uint
})

;; ================================
;; READ-ONLY
;; ================================
(define-read-only (get-escrow (id uint))
  (map-get? escrows id))

(define-read-only (get-milestone (escrow-id uint) (index uint))
  (map-get? milestones { escrow-id: escrow-id, index: index }))

(define-read-only (get-next-id)
  (var-get next-id))

(define-read-only (get-remaining (id uint))
  (match (map-get? escrows id) escrow
    (ok (- (get total-amount escrow) (get released escrow)))
    ERR-NOT-FOUND))

;; ================================
;; PUBLIC FUNCTIONS
;; ================================

;; 1. Client creates escrow with initial STX deposit
(define-public (create-escrow
  (worker   principal)
  (resolver principal)
  (deposit  uint))
  (let ((id (var-get next-id)))
    (asserts! (> deposit u0) ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq tx-sender worker)) ERR-SELF-ESCROW)
    (asserts! (not (is-eq tx-sender resolver)) ERR-SELF-ESCROW)
    (try! (stx-transfer? deposit tx-sender (as-contract tx-sender)))
    (map-set escrows id {
      client:           tx-sender,
      worker:           worker,
      resolver:         resolver,
      total-amount:     u0,
      deposited:        deposit,
      released:         u0,
      milestone-count:  u0,
      active-milestone: u0,
      state:            STATE-OPEN,
      created-at:       block-height
    })
    (var-set next-id (+ id u1))
    (ok id)))

;; 2. Client adds a milestone (can add up to MAX-MILESTONES while OPEN)
(define-public (add-milestone
  (escrow-id   uint)
  (description (string-ascii 200))
  (amount      uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-OPEN) ERR-INVALID-STATE)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (< (get milestone-count escrow) MAX-MILESTONES) ERR-CAP-EXCEEDED)
    (let ((idx (get milestone-count escrow)))
      (map-set milestones { escrow-id: escrow-id, index: idx } {
        description:     description,
        amount:          amount,
        state:           MS-PENDING,
        block-submitted: u0,
        block-resolved:  u0
      })
      (map-set escrows escrow-id (merge escrow {
        milestone-count: (+ idx u1),
        total-amount:    (+ (get total-amount escrow) amount)
      }))
      (ok idx))))

;; 3. Client activates escrow - tops up deposit to cover total if needed
(define-public (activate-escrow (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-OPEN) ERR-INVALID-STATE)
    (asserts! (> (get milestone-count escrow) u0) ERR-ZERO-AMOUNT)
    (let ((total     (get total-amount escrow))
          (deposited (get deposited escrow)))
      (let ((shortfall (if (> total deposited) (- total deposited) u0)))
        (if (> shortfall u0)
          (try! (stx-transfer? shortfall tx-sender (as-contract tx-sender)))
          true)
        (map-set escrows escrow-id (merge escrow {
          state:     STATE-ACTIVE,
          deposited: total
        }))
        (ok true)))))

;; 4. Worker submits a milestone as complete
(define-public (submit-milestone (escrow-id uint) (index uint))
  (let (
    (escrow    (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get worker escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-INVALID-STATE)
    (asserts! (is-eq (get state milestone) MS-PENDING) ERR-INVALID-STATE)
    (asserts! (is-eq index (get active-milestone escrow)) ERR-INVALID-STATE)
    (map-set milestones { escrow-id: escrow-id, index: index }
      (merge milestone {
        state:           MS-SUBMITTED,
        block-submitted: block-height
      }))
    (ok true)))

;; 5. Client approves milestone - releases STX to worker
(define-public (approve-milestone (escrow-id uint) (index uint))
  (let (
    (escrow    (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-NOT-FOUND))
    (amount    (get amount milestone))
  )
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-INVALID-STATE)
    (asserts! (is-eq (get state milestone) MS-SUBMITTED) ERR-INVALID-STATE)
    (try! (as-contract (stx-transfer? amount tx-sender (get worker escrow))))
    (map-set milestones { escrow-id: escrow-id, index: index }
      (merge milestone { state: MS-APPROVED, block-resolved: block-height }))
    (let (
      (next-ms    (+ index u1))
      (released   (+ (get released escrow) amount))
      (done       (>= next-ms (get milestone-count escrow)))
      (new-state  (if done STATE-COMPLETE STATE-ACTIVE))
    )
      (map-set escrows escrow-id (merge escrow {
        released:         released,
        active-milestone: next-ms,
        state:            new-state
      }))
      (ok done))))

;; 6. Either party raises a dispute on a submitted milestone
(define-public (raise-dispute (escrow-id uint) (index uint))
  (let (
    (escrow    (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-NOT-FOUND))
  )
    (asserts!
      (or (is-eq tx-sender (get client escrow))
          (is-eq tx-sender (get worker escrow)))
      ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-INVALID-STATE)
    (asserts! (is-eq (get state milestone) MS-SUBMITTED) ERR-INVALID-STATE)
    (map-set milestones { escrow-id: escrow-id, index: index }
      (merge milestone { state: MS-DISPUTED }))
    (map-set escrows escrow-id (merge escrow { state: STATE-DISPUTED }))
    (ok true)))

;; 7. Resolver decides: pay worker or refund client for disputed milestone
(define-public (resolve-dispute
  (escrow-id        uint)
  (index            uint)
  (release-to-worker bool))
  (let (
    (escrow    (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones { escrow-id: escrow-id, index: index }) ERR-NOT-FOUND))
    (amount    (get amount milestone))
  )
    (asserts! (is-eq tx-sender (get resolver escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-DISPUTED) ERR-INVALID-STATE)
    (asserts! (is-eq (get state milestone) MS-DISPUTED) ERR-INVALID-STATE)
    (let ((recipient (if release-to-worker (get worker escrow) (get client escrow))))
      (try! (as-contract (stx-transfer? amount tx-sender recipient)))
      (map-set milestones { escrow-id: escrow-id, index: index }
        (merge milestone { state: MS-APPROVED, block-resolved: block-height }))
      (let (
        (next-ms   (+ index u1))
        (released  (+ (get released escrow) amount))
        (done      (>= next-ms (get milestone-count escrow)))
        (new-state (if done STATE-COMPLETE STATE-ACTIVE))
      )
        (map-set escrows escrow-id (merge escrow {
          released:         released,
          active-milestone: next-ms,
          state:            new-state
        }))
        (ok release-to-worker)))))

;; 8. Client cancels before activation - full deposit refund
(define-public (cancel-escrow (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get client escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get state escrow) STATE-OPEN) ERR-INVALID-STATE)
    (try! (as-contract (stx-transfer? (get deposited escrow) tx-sender (get client escrow))))
    (map-set escrows escrow-id (merge escrow { state: STATE-CANCELLED }))
    (ok true)))
