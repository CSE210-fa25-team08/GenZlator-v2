
# ADR-003: Implement Feedback-Driven Model Improvement via Vector Retrieval (RAG-Lite)

**ADR #:** 003
**Title:** Implement Feedback-Driven Model Improvement via Vector Retrieval (RAG-Lite)
**Date:** 2025-11-11
**Status:** Proposed

---

## 1. Context
User-submitted feedback must be utilized for quality improvement. ADR-002 confirmed that raw feedback data will be stored separately. The problem is how to leverage this growing dataset to improve LLM output (especially for slang/emojis) **without introducing slow database lookups** into the translation API's critical path, which would violate the <1000ms latency requirement of ADR-001.

---

## 2. Decision
We will adopt an **asynchronous Retrieval-Augmented Generation-Lite (RAG-Lite)** system to inject user-validated corrections into the LLM prompt at runtime.

The decision involves three phases:
1.  **Offline Pipeline:** A scheduled ETL task will process raw `(Original_Message, User_Correction)` pairs from the Feedback DB.
2.  **Vector Indexing:** The `Original_Message` will be converted to a **vector embedding** and stored in an optimized **Vector Index**.
3.  **Runtime Utilization:** The Orchestrator will query the Vector Index to retrieve $K$ semantically similar, user-corrected examples and inject them as **Few-Shot context** into the final LLM prompt.

---

## 3. Alternatives Considered
* **Option 1: Hardcoded String Matching/Cache** — Pros: Very fast. Cons: Cannot handle synonyms or near-matches; requires constant manual maintenance.
* **Option 2: Direct Database Lookup** — Pros: Simple to implement. Cons: Unacceptable latency (violates ADR-001) and poor scalability.
* **Option 3: Full LLM Fine-Tuning** — Pros: Highest quality improvement. Cons: Requires massive infrastructure cost and time, infeasible for an MVP.

---

## 4. Consequences

* **Positive Outcomes (Benefits)**
    * **Quality:** Quickly leverages user corrections for nuances like slang and emoji.
    * **Performance:** The core translation path remains fast, as vector retrieval is rapid.
    * **Scalability:** The system scales to handle a growing volume of feedback data via the dedicated Vector Index.
* **Negative Outcomes (Risks, Costs, Complexities)**
    * **Infrastructure:** Introduces new dependencies (embedding model, vector store) and the complexity of managing an asynchronous ETL pipeline.
    * **Latency of Correction:** Corrections are not immediate; they only take effect after the offline ETL job runs (e.g., 24-hour delay).
* **Affects Other Parts:** The Orchestrator must include logic to compute the input vector and format the retrieved context into the final LLM prompt.

---

## 5. Implementation Notes
* **Vector Store:** Use a tool that integrates well with the chosen database technology (e.g., PGVector).
* **Asynchronicity:** The ETL job must run on a separate, dedicated worker process, ensuring it never impacts the API Server's stability.
* **Mitigation (Risk):** Implement filtering and scoring of retrieved results to avoid injecting poor-quality or irrelevant feedback into the LLM prompt.

---

## 6. References
* Backend Proposal: Feedback Submission (Essential Requirement)
* Backend Proposal: Latency Requirements (ADR-001 Context)
* Backend Proposal: Mitigation for Translation Quality