# ADR-001: Adopt "Broadcast-to-many, First-Success" Orchestration for LLM Calls

**ADR #:** 001
**Title:** Adopt "Broadcast-to-many, First-Success" Orchestration for LLM Calls
**Date:** 2025-11-07
**Status:** Accepted

---

## 1. Context
We are building a lightweight backend service for GenZ chat translation. A **critical, essential requirement** is **low latency**, targeting an **Under 1s response time** (i.e., less than 1000ms latency). The core translation logic relies on external, lightweight LLM hosts (e.g., OpenRouter and similar providers). Relying on a single external provider is insufficient because their latency is highly variable and susceptible to individual outages, which risks consistently violating the sub-1s latency goal.

---

## 2. Decision
We will implement a **Translation Orchestrator** within the API Server that utilizes a **"Broadcast-to-many, First-Success Wins"** strategy.

This approach addresses the latency requirement by:
1.  **Concurrent Dispatch:** Sending the translation request simultaneously to multiple independent LLM hosts (via Model Provider Adapters).
2.  **Early Return:** Immediately returning the first successful and validated response received, ignoring all subsequent slower or failed responses.

---

## 3. Alternatives Considered
* **Option 1: Single Provider Failover** — Pros: Lowest cost, simplest implementation. Cons: Does not mitigate variable latency; still risks breaching the 1s target.
* **Option 2: Internal Model Hosting** — Pros: Full control over latency and cost. Cons: Requires significant setup time and resources; complexity and scope violation for an MVP.

---

## 4. Consequences

* **Positive Outcomes (Benefits)**
    * **Performance:** Significantly increases the probability of meeting the **<1000ms latency target**.
    * **Resilience:** Provides high availability and protection against single-provider failures.
* **Negative Outcomes (Risks, Costs, Complexities)**
    * **Cost:** Increases third-party API costs, as every single user request triggers multiple external calls.
    * **Complexity:** The implementation of concurrent calls, timeouts, and first-success logic is complex.
* **Affects Other Parts:** Requires the **Model Provider Adapter** component to normalize inputs and parse outputs from various external formats.

---

## 5. Implementation Notes
* **Key Design:** The Orchestrator must be designed to send requests **in parallel** (e.g., using asynchronous programming).
* **Timeout:** Implement a strict internal timeout (e.g., 800ms) to ensure the 1000ms DoD is respected.
* **Mitigation (Cost):** Implement an optional **in-process LRU cache** for repeated identical requests.

---

## 6. References
* Backend Proposal: Architecture Components
* Feature Board: "UNDER 1S RESPONSE TIME!!!"