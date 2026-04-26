# Design Document: Granular RBAC System

## Overview

This design specifies a granular Role-Based Access Control (RBAC) system for Soroban smart contracts. The system implements three distinct roles (Super_Admin, Financial_Operator, Guardian) with clearly scoped permissions, stored in persistent storage, and enforced through reusable guard functions.

The design follows least-privilege principles by separating administrative responsibilities and preventing privilege escalation. Each role has specific, non-overlapping authorities, and the system guarantees that at least one Super_Admin always exists to prevent contract lock-out.

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                  Contract Entrypoints                    │
│  (upgrade, manage_roles, set_fees, pause, freeze)       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Guard Functions                        │
│  ensure_super_admin()                                    │
│  ensure_financial_operator()                             │
│  ensure_guardian()                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Role Storage Layer                      │
│  get_role_members(role) → Vec<Address>                  │
│  add_role_member(role, address)                          │
│  remove_role_member(role, address)                       │
│  has_role(role, address) → bool                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Soroban Persistent Storage                  │
│  Key: Role enum → Value: Vec<Address>                   │
└─────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each role has distinct, non-overlapping permissions
2. **Fail-Safe Defaults**: Operations fail unless explicitly authorized
3. **Least Privilege**: Roles have only the minimum permissions needed
4. **Defense in Depth**: Multiple layers of validation (guard functions + storage checks)
5. **Auditability**: Clear error messages for unauthorized access attempts

## Components and Interfaces

### Role Enumeration

```rust
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
pub enum Role {
    SuperAdmin,
    FinancialOperator,
    Guardian,
}
```

The Role enum serves as both a type-safe identifier and a storage key discriminator.

### Storage Keys

```rust
#[derive(Clone)]
#[contracttype]
pub enum StorageKey {
    RoleMembers(Role),
}
```

Storage keys are deterministic and derived from the Role enum, ensuring consistent access patterns.

### Error Types

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RBACError {
    Unauthorized = 1,
    SuperAdminRequired = 2,
    FinancialOperatorRequired = 3,
    GuardianRequired = 4,
    AddressAlreadyHasRole = 5,
    CannotRemoveLastSuperAdmin = 6,
    AddressNotFound = 7,
}
```

Custom error types provide clear feedback for each failure condition.

### Core Storage Functions

#### get_role_members

```rust
fn get_role_members(env: &Env, role: Role) -> Vec<Address> {
    let key = StorageKey::RoleMembers(role);
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}
```

Retrieves all addresses assigned to a role. Returns empty vector if role has no members.

#### has_role

```rust
fn has_role(env: &Env, role: Role, address: &Address) -> bool {
    let members = get_role_members(env, role);
    members.iter().any(|member| member == address)
}
```

Checks if an address is assigned to a role. O(n) lookup where n is the number of role members.

#### add_role_member

```rust
fn add_role_member(env: &Env, role: Role, address: Address) -> Result<(), RBACError> {
    let mut members = get_role_members(env, role);
    
    // Check for duplicates
    if members.iter().any(|member| member == &address) {
        return Err(RBACError::AddressAlreadyHasRole);
    }
    
    members.push_back(address);
    
    let key = StorageKey::RoleMembers(role);
    env.storage().persistent().set(&key, &members);
    
    Ok(())
}
```

Adds an address to a role, preventing duplicates.

#### remove_role_member

```rust
fn remove_role_member(env: &Env, role: Role, address: &Address) -> Result<(), RBACError> {
    let mut members = get_role_members(env, role);
    
    // Find the address
    let position = members
        .iter()
        .position(|member| member == address)
        .ok_or(RBACError::AddressNotFound)?;
    
    // Prevent removing last Super Admin
    if role == Role::SuperAdmin && members.len() == 1 {
        return Err(RBACError::CannotRemoveLastSuperAdmin);
    }
    
    members.remove(position as u32);
    
    let key = StorageKey::RoleMembers(role);
    env.storage().persistent().set(&key, &members);
    
    Ok(())
}
```

Removes an address from a role, enforcing the Super Admin existence guarantee.

### Guard Functions

#### ensure_super_admin

```rust
fn ensure_super_admin(env: &Env) {
    let invoker = env.invoker();
    if !has_role(env, Role::SuperAdmin, &invoker) {
        panic_with_error!(env, RBACError::SuperAdminRequired);
    }
}
```

Validates that the invoker has Super Admin privileges. Panics with descriptive error if unauthorized.

#### ensure_financial_operator

```rust
fn ensure_financial_operator(env: &Env) {
    let invoker = env.invoker();
    if !has_role(env, Role::FinancialOperator, &invoker) {
        panic_with_error!(env, RBACError::FinancialOperatorRequired);
    }
}
```

Validates that the invoker has Financial Operator privileges.

#### ensure_guardian

```rust
fn ensure_guardian(env: &Env) {
    let invoker = env.invoker();
    if !has_role(env, Role::Guardian, &invoker) {
        panic_with_error!(env, RBACError::GuardianRequired);
    }
}
```

Validates that the invoker has Guardian privileges.

### Public Contract Functions

#### initialize

```rust
#[contractimpl]
impl RBACContract {
    pub fn initialize(env: Env, super_admin: Address) -> Result<(), RBACError> {
        // Ensure contract is not already initialized
        let members = get_role_members(&env, Role::SuperAdmin);
        if !members.is_empty() {
            panic_with_error!(&env, RBACError::Unauthorized);
        }
        
        super_admin.require_auth();
        add_role_member(&env, Role::SuperAdmin, super_admin)?;
        
        Ok(())
    }
}
```

Initializes the contract with the first Super Admin. Can only be called once.

#### add_role

```rust
pub fn add_role(env: Env, role: Role, address: Address) -> Result<(), RBACError> {
    ensure_super_admin(&env);
    address.require_auth();
    add_role_member(&env, role, address)
}
```

Adds an address to a role. Requires Super Admin authorization.

#### remove_role

```rust
pub fn remove_role(env: Env, role: Role, address: Address) -> Result<(), RBACError> {
    ensure_super_admin(&env);
    remove_role_member(&env, &address, role)
}
```

Removes an address from a role. Requires Super Admin authorization.

#### upgrade_contract

```rust
pub fn upgrade_contract(env: Env, new_wasm_hash: BytesN<32>) {
    ensure_super_admin(&env);
    env.deployer().update_current_contract_wasm(new_wasm_hash);
}
```

Upgrades the contract to new WASM code. Requires Super Admin authorization.

#### set_fee

```rust
pub fn set_fee(env: Env, fee_amount: i128) {
    ensure_financial_operator(&env);
    // Fee setting logic here
    let key = StorageKey::Fee;
    env.storage().persistent().set(&key, &fee_amount);
}
```

Sets or updates fee parameters. Requires Financial Operator authorization.

#### pause_contract

```rust
pub fn pause_contract(env: Env) {
    ensure_guardian(&env);
    let key = StorageKey::Paused;
    env.storage().persistent().set(&key, &true);
}
```

Pauses contract operations. Requires Guardian authorization.

#### unpause_contract

```rust
pub fn unpause_contract(env: Env) {
    ensure_guardian(&env);
    let key = StorageKey::Paused;
    env.storage().persistent().set(&key, &false);
}
```

Unpauses contract operations. Requires Guardian authorization.

#### freeze_contract

```rust
pub fn freeze_contract(env: Env) {
    ensure_guardian(&env);
    let key = StorageKey::Frozen;
    env.storage().persistent().set(&key, &true);
}
```

Freezes contract operations (emergency state). Requires Guardian authorization.

## Data Models

### Role Membership Storage

**Storage Structure:**
```
Key: StorageKey::RoleMembers(Role::SuperAdmin)
Value: Vec<Address> = [addr1, addr2, addr3]

Key: StorageKey::RoleMembers(Role::FinancialOperator)
Value: Vec<Address> = [addr4, addr5]

Key: StorageKey::RoleMembers(Role::Guardian)
Value: Vec<Address> = [addr6, addr7, addr8]
```

**Properties:**
- Each role maps to a vector of addresses
- Vectors are stored in persistent storage
- Empty vectors are represented as missing keys (unwrap_or returns empty Vec)
- No cross-role data dependencies

### Storage Key Design

Storage keys use the `StorageKey` enum with role discriminators:
- Deterministic: Same role always produces same key
- Type-safe: Rust's type system prevents key collisions
- Efficient: Direct key derivation without hashing

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

