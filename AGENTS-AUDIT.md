# File: AGENTS‑AUDIT.md

## OVERVIEW  
This document defines a **recursive, top‑down audit protocol** for the entire codebase, intended to be executed by an AI coding agent (e.g. OpenAI Codex). Its primary objective is to identify *every* area of the codebase that is not yet production‑ready, flag incomplete logic, detect unwired UI elements, spot data‑binding gaps, and uncover dependency or build‑configuration weaknesses. The output of this audit must be a list of flagged issues (with file / line references), plus actionable remediation steps, ensuring full operational readiness and zero regressions.

---

## 1. Audit Phases & Scope

### 1.1 Audit Phases  
The audit is composed of the following phases, each with clearly defined objectives:

| Phase | Objective |
|-------|-----------|
| **Inventory** | Build a complete map of all components, UI elements, services, utilities, contexts — including imports/dependencies and usage graphs. |
| **UI Layer Inspection (“UNWIRED COMPONENTS”)** | For each interactive UI element (buttons, forms, modals, editors, toggles, selectors, etc.), verify that event handlers are implemented, point to real functions, and that those functions effect expected state changes or service calls. Flag any stubs, null callbacks, or miswired handlers. |
| **Logic & Service Examination (“INCOMPLETE LOGIC”)** | Traverse service modules (`services.ts`, utility modules, business logic, context providers, etc.) and identify functions with placeholder code (e.g. `// TODO`, commented-out blocks, `throw new Error("not implemented")`, incomplete promise flows, lack of error handling, missing edge-case treatment, or unhandled rejection paths). |
| **State & Data‑Binding Audit (“DATA-BINDING GAPS”)** | Cross-reference UI components with state/context/data layers: ensure that data displayed in UI is backed by state or props, that user inputs are properly propagated to state, and that state changes reflect in UI. Flag any UI rendering of uninitialized data, missing context providers, or unconnected form inputs. |
| **Dependency & Build Analysis (“DEPENDENCY ANALYSIS”)** | Examine `package.json`, import graphs, build config (`vite.config.ts`), and module usage to identify: deprecated dependencies, unused/unused‑imported libraries, heavy dependencies not tree‑shakable, side‑effect‑laden libraries; improper or risky build config (e.g. potential for bundle bloat, missing production settings), unsound imports that may hinder tree-shaking or cause duplicates. |
| **Configuration & Environment Readiness Check** | Review environment configs, build scripts, type definitions, error boundaries, fallback UI, environment variable handling, and ensure no secrets or credentials are hard‑coded. Also ensure build settings are tuned for production (no dev-only flags, no debugging traces, no source‑maps if unnecessary, etc.). |
| **Integration & Regression Validation (“SUPERSET CHECK”)** | After any remediation or change, run a full build, type‑check, optionally a test suite (if exists), and manual or automated UI smoke test to ensure no feature was lost or weakened. Everything previously working must remain functional; regressions are unacceptable. |

### 1.2 Scope  
- All `.tsx`, `.ts`, `.js`, `.json`, `vite.config.ts`, `package.json`, configuration files are in scope.  
- All UI components under `/Components`, context providers, service modules, utils, and root-level app files.  
- Build configuration and dependencies.  
- No external dependencies outside declared packages are allowed unless explicitly approved; new dependencies must be evaluated for size, security, and maintainability.

---

## 2. Audit Methodology & Guidelines  

### 2.1 Inventory & Mapping  
- Generate a full dependency graph (import tree) of the codebase.  
- Generate a full component usage map: where each component is used, which parent renders it, what props/context it receives.  
- Produce a list of all interactive UI elements (buttons, forms, inputs, modals, menu items, selectors, etc.), with their handler references.  

### 2.2 UI Layer Inspection  
For each UI element in the list:  
- Confirm the presence of an event handler (`onClick`, `onSubmit`, `onChange`, etc.).  
- Confirm that the handler references a function (not `null`, not `() => {}` no‑op).  
- Confirm that the referenced function actually executes meaningful logic: alters state, triggers service call, or routes navigation.  
- For modals or conditional-render components: confirm that the logic to open/close them is connected to state and that closing cleans up properly.  
- For any instance where the handler is missing, stubbed, or refers to a non‑existent function: flag as **UNWIRED COMPONENT**.  

### 2.3 Logic & Service Examination  
- Search for placeholder markers: `// TODO`, `// FIXME`, commented-out code blocks, unimplemented error handling, `throw new Error("...")` used as stub, `// PLACEHOLDER`, etc.  
- Search for asynchronous operations (fetch, promises) — ensure `catch` or `.catch`, or `try/catch` around `await`; flag unhandled promises.  
- For all service calls: validate that return types are handled appropriately (success, error, loading states), and that UI consuming the service reflects these states (loading spinner, error message, fallback).  
- Flag any logic that relies on implicit non‑null assertions without runtime guard (e.g., `someObj!.prop`), or unsafe type casts.  

### 2.4 State & Data‑Binding Audit  
- For each piece of data rendered in JSX: trace back to props / context / state / service. If data is hardcoded or uses magic strings without central constants, flag potential maintainability issue.  
- For forms and inputs: ensure controlled components (value tied to state/prop, `onChange` updates state). Flag uncontrolled form elements where state is expected.  
- For context providers: ensure that relevant contexts wrap all components needing them; flag any components consuming context outside provider tree.  
- For lists or repeated UI (file lists, history, version lists, diff lists): confirm correct `key` props, pagination or virtualization if list is large or potentially large.  

### 2.5 Dependency & Build Analysis  
- Examine `package.json` and list dependencies. For each dependency: verify usage — if no import exists in codebase, mark as unused (candidates for removal).  
- For imported dependencies: check if imported via full library (e.g. `import _ from 'lodash'`) — if so, flag for refactor to per-function import (for tree-shaking).  
- Inspect `vite.config.ts`: ensure production build settings, no debugging-only flags, correct module resolution, minimal plugins, no unnecessary polyfills, etc. Flag any sub-optimal settings that may lead to bundle bloat.  
- Check that `tsconfig.json` and other config files do not have overly permissive settings (e.g. `allowJs`, `skipLibCheck`, `noImplicitAny: false`, etc.) — flag if they hinder type safety.  

### 2.6 Configuration & Environment Readiness  
- Inspect any `.env` or environment config usage for proper secret handling: no hard-coded API keys, credentials, secrets. Flag any occurrences.  
- Ensure error boundaries are in place for major UI modules (e.g. code editors, diff viewers, markdown renderer, external content display). If error boundaries are missing where needed, flag for addition.  
- Ensure fallback UI (loading spinners, skeleton screens, error messages) exist for async loads or lazy‑loaded components. Flag missing fallback or unhandled loading/error states.  

### 2.7 Superset-Check & Regression Verification  
- After proposed modifications or refactors, run full build and type-check.  
- If the codebase includes tests: run tests; ensure **100% pass** (or existing baseline pass count).  
- For UI: perform manual or automated smoke test — verify major flows (app load, login/initialization if any, navigation/menu open, modals open/close, forms work, data display, any sample service calls).  
- Compare feature inventory before and after change — no feature should be removed or disabled.  

---

## 3. Audit Output Format (for CODEX agent)  

When the audit completes, the agent must produce a structured report in JSON (or plaintext table), with entries like:

```jsonc
[
  {
    "type": "UNWIRED_COMPONENT",
    "file": "src/Components/SaveVersionModal.tsx",
    "line": 345,
    "description": "Submit button has onClick={null} — no handler defined; modal cannot save version.",
    "severity": "HIGH",
    "recommendation": "Implement saveVersion() handler or connect to context API."
  },
  {
    "type": "INCOMPLETE_LOGIC",
    "file": "src/services.ts",
    "function": "fetchProjectFiles",
    "line": 120,
    "description": "No .catch handler on promise; errors from network or API will be unhandled.",
    "severity": "MEDIUM",
    "recommendation": "Add try/catch around await, propagate error to caller or UI."
  },
  {
    "type": "DATA_BINDING_GAP",
    "file": "src/Components/ContextFilesSelector.tsx",
    "line": 78,
    "description": "Checkbox list renders file names from prop `files`, but state update on selection does not propagate to parent — selectedFiles remains undefined.",
    "severity": "HIGH",
    "recommendation": "Connect onChange handler to parent prop callback or context store."
  },
  {
    "type": "DEPENDENCY_UNUSED",
    "dependency": "some-unused-lib",
    "version": "1.2.3",
    "description": "No import usages found in codebase — candidate for removal.",
    "severity": "LOW",
    "recommendation": "Remove from package.json and run `npm prune`."
  }
  // …
]
```

Additionally, a summary block: total number of issues by severity and category, plus risk assessment (e.g. “X HIGH, Y MEDIUM, Z LOW”), and recommended next steps.

---

## 4. Agent Instructions & Behavior Constraints  

- **Silent execution**: the audit must be run internally by the agent; no user-visible side effects or noisy logs (unless in final report).  
- **Non‑destructive by default**: do not modify code unless explicitly instructed — first produce audit findings before any auto-fix.  
- **When auto-fix is applied (on user request), always include before/after diff and run full build & type‑check for verification.**  
- **All code changes must preserve existing behavior (superset-check).**  
- **Prefer minimal, local scope changes (per file or small module) over large-scale refactors — unless ROI is justified (e.g. bundle bloat, dependency removal).**  
- **Document every change with inline comments or docstrings; update README or relevant documentation if structure or API changes.**  

---

## 5. Example Audit Commands / Entrypoints for CODEX  

Within your prompt to CODEX, you can issue:

```
@codex audit —phase=inventory
```
→ returns full dependency & component usage graph.

```
@codex audit —phase=ui-layer
```
→ returns list of all unwired or stubbed UI components.

```
@codex audit —phase=logic
```
→ returns service/logic issues (incomplete logic, missing error handling, unhandled promise, etc.)

```
@codex audit —phase=state-binding
```
→ returns data-binding & context/state gaps.

```
@codex audit —phase=dependency
```
→ returns unused/deprecated dependencies, import inefficiencies.

```
@codex audit —phase=full
```
→ runs all phases and returns consolidated full-audit report.

Optionally:

```
@codex fix <issue‑id> —apply
```
→ apply auto-fix (if trivial) and re-run build & type-check; attach diff and test/build output in report.

---

## 6. Mapping to Best Practices & Production Readiness Standards  

This audit protocol draws on recognized best practices for React/TypeScript applications and production deployment. Important checkpoints include:

- Ensuring correct use of React Hooks, state, props, and contexts; avoiding unused state/props and preventing prop‑drilling or uncontrolled components. :contentReference[oaicite:0]{index=0}  
- Guaranteeing error handling and resilience: service calls must have error handling, UI must show fallback states (loading, error), and critical UI paths must have error boundaries if rendering dynamic content. :contentReference[oaicite:1]{index=1}  
- Minimizing bundle size and avoiding unnecessary dependencies; enabling tree‑shaking and removing unused code/deps; particularly important for a sandboxed environment. :contentReference[oaicite:2]{index=2}  
- Enforcing a “superset check” policy: any refactor should not remove or degrade existing features — ensuring forward progress without regression.  

---

## 7. Risk Categories & Severity Levels  

Use these levels when flagging issues:

- **CRITICAL** — missing handler or logic that breaks core functionality; unhandled exceptions; missing essential data binding; blatant security risks (e.g. hard-coded secrets).  
- **HIGH** — UI elements non-functional or poorly wired; incomplete error handling; data‑binding gaps; missing fallback UI; severe dependency bloat.  
- **MEDIUM** — missing edge-case handling; uncontrolled form components; redundant or risky imports that increase bundle size but not break functionality if present.  
- **LOW** — unused dependencies; minor stylistic issues; optional optimizations (e.g. import refactor, code cleanup, commenting).  

---

## 8. Post‑Audit Deliverables  

When audit is complete (or at each sub-phase), agent must produce:

1. Full audit report (as described, JSON or table).  
2. Summary by severity and category.  
3. Suggested next steps / prioritized remediation list (starting with CRITICAL and HIGH items).  
4. If auto-fixes applied: diff patch(es), build & type-check logs, optionally test logs.  
5. A small “audit manifest” file — e.g. `AUDIT_REPORT_YYYYMMDD.json` — for historical record & traceability.  

---

## 9. Notes on Using This Protocol with OpenAI Codex  

- This protocol deliberately mirrors best‑practice code audit and production readiness checklists, positioning CODEX as an autonomous audit & remediation agent. Using such structured instructions aligns with recommended patterns for AI-assisted code generation and review. :contentReference[oaicite:3]{index=3}  
- The “superset‑check” requirement is a strong safety net to prevent regressions, especially when using automated refactoring or code‑splitting — a common risk when reshaping large codebases.  
- After using this audit protocol, the codebase should transition from “development / beta” to “production‑ready”: well‑typed, no stubs or dead code, modularized, optimized, with dependencies minimized, and UI fully wired.  

