# Contributing to StellarStream 🌊

First off, thank you for considering contributing to StellarStream! It's people like you that make the Stellar ecosystem a great place to build.

StellarStream is a community-driven project for the **Drips Stellar Wave**. We use a modular architecture and an **Issue-First** workflow to ensure a clean, decentralized build process.

---

## 🛠 Our "Issue-First" Workflow

To maintain order, we do not allow direct Pull Requests that aren't linked to an existing issue.

1.  **Find an Issue**: Browse the [Issues] tab. Look for the `[Task]` prefix.
2.  **Claim it**: Comment on the issue you want to work on. A maintainer will assign it to you.
3.  **Initialize & Build**: If you are claiming an **Initialization Issue**, you are responsible for creating the folder structure for that specific module (e.g., `/contracts`, `/frontend`, or `/backend`).
4.  **Submit a PR**: Once your task is complete, open a Pull Request and link it using `Closes #IssueNumber`.

---

## 🏗 Project Structure (The "Empty Folders" Strategy)

This repository starts as a blank canvas. We are building the following three independent modules. If the folder doesn't exist yet, it's because **nobody has claimed the Initialization Task yet!**

-   **`/contracts`**: The Soroban smart contract logic (Rust).
-   **`/frontend`**: The user dashboard (Next.js + Tailwind).
-   **`/backend`**: The indexing and analytics layer (Node.js/TypeScript).

---

## 🦀 Smart Contract Guidelines (`/contracts`)

-   **Language**: Rust (Targeting `wasm32-unknown-unknown`).
-   **SDK**: `soroban-sdk`.
-   **Testing**: All logic must be accompanied by unit tests using the `cargo test` suite.
-   **Formatting**: Run `cargo fmt` before committing.

## ⚛️ Frontend Guidelines (`/frontend`)

-   **Framework**: Next.js 14+ (App Router).
-   **Styling**: Tailwind CSS.
-   **State**: Preferred state management is Zustand or React Context.
-   **Wallet**: Integration must use the Freighter Wallet API.

## 🗄️ Backend Guidelines (`/backend`)

-   **Runtime**: Node.js with TypeScript.
-   **Database**: PostgreSQL (provided via Docker Compose).
-   **Goal**: Listen for Soroban events and serve them via a REST API.

---

## 📝 Commit Message Convention

We use clean, imperative commit messages. Please format yours like this:
-   `feat: add linear streaming math to contract`
-   `fix: resolve freighter connection timeout`
-   `chore: initialize backend docker environment`

---

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the **MIT License** of this project.

**Questions?** Open a "Discussion" or an "Issue" titled `[Question] ...` and we'll get back to you!
