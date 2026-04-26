# Implementation Plan: Granular RBAC System

## Overview

This implementation plan breaks down the granular RBAC system into discrete coding tasks. The system will be implemented in Rust for Soroban smart contracts, with three distinct roles (Super_Admin, Financial_Operator, Guardian) enforced through guard functions and persistent storage.

The implementation follows an incremental approach: core data structures → storage layer → guard functions → public entrypoints → testing. Each task builds on previous work and includes specific requirements references for traceability.

## Tasks

- [x] 1. Set up project structure and core types
  - Create Soroban contract project structure with `soroban-sdk` dependency
  - Define `Role` enum with SuperAdmin, FinancialOperator, and Guardian variants
  - Define `StorageKey` enum with RoleMembers variant
  - Define `RBACError` enum with all error types (Unauthorized, SuperAdminRequired, FinancialOperatorRequired, GuardianRequired, AddressAlreadyHasRole, CannotRemoveLastSuperAdmin, AddressNotFound)
  - Add `#[contracttype]` and `#[contracterror]` attributes as specified in design
  - _Requirements: 1.4, 10.4_

- [x] 2. Implement core storage layer functions
  - [x] 2.1 Implement `get_role_members` function
    - Accept `env: &Env` and `role: Role` parameters
    - Retrieve role members from persistent storage using `StorageKey::RoleMembers(role)`
    - Return `Vec<Address>`, defaulting to empty vector if key doesn't exist
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement `has_role` function
    - Accept `env: &Env`, `role: Role`, and `address: &Address` parameters
    - Call `get_role_members` and check if address exists in the vector
    - Return boolean indicating membership
    - _Requirements: 2.2, 11.1_

  - [x] 2.3 Implement `add_role_member` function
    - Accept `env: &Env`, `role: Role`, and `address: Address` parameters
    - Retrieve current role members using `get_role_members`
    - Check for duplicate addresses and return `RBACError::AddressAlreadyHasRole` if found
    - Append address to vector using `push_back`
    - Store updated vector in persistent storage
    - Return `Result<(), RBACError>`
    - _Requirements: 2.1, 3.1, 3.2, 3.3_

  - [x] 2.4 Implement `remove_role_member` function
    - Accept `env: &Env`, `role: Role`, and `address: &Address` parameters
    - Retrieve current role members using `get_role_members`
    - Find address position in vector, return `RBACError::AddressNotFound` if not found
    - Check if removing last Super Admin, return `RBACError::CannotRemoveLastSuperAdmin` if true
    - Remove address from vector using `remove(position)`
    - Store updated vector in persistent storage
    - Return `Result<(), RBACError>`
    - _Requirements: 2.3, 4.1, 4.2, 10.3_

- [x] 3. Implement guard functions
  - [x] 3.1 Implement `ensure_super_admin` function
    - Accept `env: &Env` parameter
    - Get invoker address using `env.invoker()`
    - Call `has_role` to check if invoker is Super Admin
    - Panic with `RBACError::SuperAdminRequired` if check fails
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 10.1_

  - [x] 3.2 Implement `ensure_financial_operator` function
    - Accept `env: &Env` parameter
    - Get invoker address using `env.invoker()`
    - Call `has_role` to check if invoker is Financial Operator
    - Panic with `RBACError::FinancialOperatorRequired` if check fails
    - _Requirements: 5.2, 5.4, 5.5, 5.6, 10.1_

  - [x] 3.3 Implement `ensure_guardian` function
    - Accept `env: &Env` parameter
    - Get invoker address using `env.invoker()`
    - Call `has_role` to check if invoker is Guardian
    - Panic with `RBACError::GuardianRequired` if check fails
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 10.1_

- [ ] 4. Implement contract initialization and role management
  - [x] 4.1 Implement `initialize` contract function
    - Accept `env: Env` and `super_admin: Address` parameters
    - Check if contract is already initialized by calling `get_role_members` for SuperAdmin role
    - Panic with `RBACError::Unauthorized` if already initialized
    - Require authentication from `super_admin` address
    - Call `add_role_member` to add the super admin
    - Return `Result<(), RBACError>`
    - _Requirements: 4.3, 1.1_

  - [x] 4.2 Implement `add_role` contract function
    - Accept `env: Env`, `role: Role`, and `address: Address` parameters
    - Call `ensure_super_admin` guard function
    - Require authentication from `address` parameter
    - Call `add_role_member` to add the address to the role
    - Return `Result<(), RBACError>`
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 4.3 Implement `remove_role` contract function
    - Accept `env: Env`, `role: Role`, and `address: Address` parameters
    - Call `ensure_super_admin` guard function
    - Call `remove_role_member` to remove the address from the role
    - Return `Result<(), RBACError>`
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 5. Checkpoint - Ensure core RBAC functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement protected contract operations
  - [x] 6.1 Implement `upgrade_contract` function
    - Accept `env: Env` and `new_wasm_hash: BytesN<32>` parameters
    - Call `ensure_super_admin` guard function
    - Call `env.deployer().update_current_contract_wasm(new_wasm_hash)`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.2 Implement `set_fee` function
    - Accept `env: Env` and `fee_amount: i128` parameters
    - Call `ensure_financial_operator` guard function
    - Store fee amount in persistent storage using appropriate storage key
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 6.3 Implement `pause_contract` function
    - Accept `env: Env` parameter
    - Call `ensure_guardian` guard function
    - Store paused state (true) in persistent storage
    - _Requirements: 9.1, 9.4, 9.5_

  - [x] 6.4 Implement `unpause_contract` function
    - Accept `env: Env` parameter
    - Call `ensure_guardian` guard function
    - Store paused state (false) in persistent storage
    - _Requirements: 9.2, 9.4, 9.5_

  - [x] 6.5 Implement `freeze_contract` function
    - Accept `env: Env` parameter
    - Call `ensure_guardian` guard function
    - Store frozen state (true) in persistent storage
    - _Requirements: 9.3, 9.4, 9.5_

- [x] 7. Implement query functions
  - [x] 7.1 Implement `get_role_members` public query function
    - Accept `env: Env` and `role: Role` parameters
    - Call internal `get_role_members` function
    - Return `Vec<Address>` of all addresses with the specified role
    - Mark as read-only view function
    - _Requirements: 2.2_

  - [x] 7.2 Implement `has_role` public query function
    - Accept `env: Env`, `role: Role`, and `address: Address` parameters
    - Call internal `has_role` function
    - Return boolean indicating if address has the role
    - Mark as read-only view function
    - _Requirements: 2.2, 11.1_

- [-] 8. Final checkpoint - Ensure all functionality is integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All storage operations use Soroban's persistent storage layer for durability across contract upgrades
- Guard functions use `panic_with_error!` macro for authorization failures
- The `address.require_auth()` pattern ensures addresses consent to role assignments
- Storage keys are deterministic and derived from the Role enum
- Error types provide clear feedback for debugging and user experience
- The system enforces that at least one Super Admin always exists to prevent contract lock-out
