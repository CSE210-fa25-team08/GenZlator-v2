# ADR-002: Defer Full User System and Maintain Stateless API for MVP

**ADR #:** 002
**Title:** Defer Full User System and Maintain Stateless API for MVP
**Date:** 2025-11-08
**Status:** Accepted

---

## 1. Context
The project feature board lists several "Maybe" features (history, gamification, user-chosen models) that require persistent user data. The **Essential Scope** is defined strictly as basic translation and feedback submission. Implementing a full user system (registration, login, database setup) would significantly expand the MVP scope and delay the delivery of the core translation value.

---

## 2. Decision
We will **defer the implementation of a full user system** for the MVP.

The backend decision is to:
1.  Keep the **Core API Server Stateless**.
2.  Explicitly exclude all "Maybe" APIs marked as "Requires DB" (e.g., `/api/v1/user/*`) from the MVP.
3.  Utilize the **Data Persistence Layer** solely for collecting anonymous feedback data.

---

## 3. Alternatives Considered
* **Option 1: Include User History (Minimum DB)** — Pros: Adds basic personalization. Cons: Still requires significant complexity for authentication and database schema, risking scope creep.
* **Option 2: Delay Feedback API** — Pros: Focuses solely on translation. Cons: Violates the "Essential" requirement for quality iteration.

---

## 4. Consequences

* **Positive Outcomes (Benefits)**
    * **Focus & Speed:** Allows the team to focus exclusively on the high-performance core (ADR-001) and essential feedback loop.
    * **Architecture:** Simplifies the architecture by maintaining statelessness, easing horizontal scaling.
    * **Risk Mitigation:** Avoids the immediate complexity associated with implementing user sessions and privacy compliance.
* **Negative Outcomes (Risks, Costs, Complexities)**
    * **Limited Features:** Cannot offer user history, achievements, or persistent personalized preferences.
    * **Contextual Limitation:** "Nice-to-have" contextual features must rely on the client explicitly sending the necessary context (e.g., `chatHistory`) with every request.
* **Affects Other Parts:** The `/api/v1/feedback` endpoint must use an `anonymousId` instead of a registered user ID.

---

## 5. Implementation Notes
* **Database:** The Data Persistence Layer will initially only support the Feedback schema, utilizing a lightweight store.
* **Contextual Data:** Ensure the `/api/v1/translate` request structure includes the `chatHistory` placeholder for future expansion.
* **Roadmap:** The deferred `/api/v1/user/*` endpoints serve as a clear roadmap for V2 development.

---

## 6. References
* Backend Proposal: API Definition Table
* Backend Proposal: Data Persistence Layer
* Feature Board: "Maybe?" Column
