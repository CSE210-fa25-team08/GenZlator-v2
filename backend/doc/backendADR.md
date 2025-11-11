## ADR-001: Adopt "Broadcast-to-many, First-Success" Orchestration for External LLMs

- **Status**: Accepted  
- **Date**: 2025.11.7

### Context

The core non-functional requirement for the GenZ Translation backend is **low latency**, specifically aiming for **Under 1000ms response time** (per the functional board). We rely on external, lightweight LLM hosts (e.g., OpenRouter models) for translation capability. However, single provider latency is volatile and subject to external service disruptions, making it impossible to guarantee the sub-1s target.

### Decision

We will implement a **Translation Orchestrator** in the API server that uses a **"Broadcast-to-many, First-Success Wins"** strategy:

1. **Concurrent Broadcast**: The Orchestrator will concurrently dispatch the standardized translation prompt to multiple independent LLM providers/models.  
2. **First Success**: It will immediately return the first response that is successful and passes basic validation (e.g., not empty, correct format).  
3. **Timeout & Cancellation**: A strict internal timeout (e.g., 800ms) will be set. All slower or failed requests will be ignored/canceled immediately.  
4. **Adapter Layer**: Use a Model Provider Adapter pattern to standardize request/response formats across different external APIs.

### Consequences (Trade-offs)

| Type | Impact |
| :---- | :---- |
| **\+ Positive** | Significantly increases the probability of meeting the \<1000ms latency goal by always capturing the fastest available service. |
| **\+ Positive** | Provides high availability and resilience against single-provider performance degradation or outages. |
| **\- Negative** | **Cost:** Every user request will trigger multiple external API calls (e.g., 2-3x), substantially increasing third-party API costs. |
| **\- Negative** | **Complexity:** Implementing robust concurrent calls, timeouts, and cancellations adds complexity compared to a simple proxy. |

---

## ADR-002: Defer Full User System and Maintain Stateless API for MVP

- **Status**: Accepted  
- **Date**: 2025.11.8

### Context

The project proposal includes several "Nice-to-have" and "Maybe" features that require a database and persistent user data, such as "Gamify it (achievements/stats)," "Country-based contextual translation," and "Show user history." Implementing a full user system (registration, auth, sessions, DB) is complex and falls outside the project's **Essential Scope** (which is strictly defined as the core `/translate/basic` and `translate/feedback` APIs).

### Decision

To prioritize the delivery of the core translation functionality and simplify the architecture, we decide to **defer the implementation of a full user system** for the Minimum Viable Product (MVP).

1. The core API server will be designed as **stateless**.  
2. All endpoints requiring a DB/user system (`/api/v1/user/*`) will be excluded from the MVP scope.  
3. The necessary `/api/v1/feedback` API will use an `anonymousId` instead of a registered user login to track feedback sources.  
4. Any "Nice-to-have" contextual data (e.g., country code) must be explicitly passed by the client on *every request* (e.g., in a request body field), rather than retrieved from a stored user profile.

### Consequences (Trade-offs)

| Type | Impact |
| :---- | :---- |
| **\+ Positive** | Dramatically reduces the scope and risk of the MVP, allowing the team to focus entirely on the high-performance translation core (ADR-001). |
| **\+ Positive** | Simplifies the architecture by avoiding the complexity of databases, authentication, and user data privacy concerns (GDPR). |
| **\- Negative** | Data Poison Risk: If we have a user system, we can make every users' own history only affect their prompt. Otherwise, naughty or malicious individuals may intentionally mislead the model to produce worse results. |
| **\- Negative** | **Feature Limitation:** The MVP will lack all personalization features (achievements, custom contexts, history viewing). |
| **\- Negative** | The contextual translation, if implemented, will be less convenient as the client must manage and send contextual data repeatedly. |
| **Future Work** | This decision defines a clear roadmap for future versions, where the `/api/v1/user/*` endpoints will be implemented. |

## ---

## ADR-003: Implement Feedback-Driven Model Improvement via Vector Retrieval (RAG-Lite)

* **Status**: Proposed  
* **Date**: 2025.11.10

### **Context**

ADR-002 established that user feedback (/api/v1/feedback) will be stored in a separate, lightweight NoSQL database, decoupled from the core translation service. To fulfill the "Feedback & quality" essential requirement and continuously improve translation quality (especially for slang and emoji), we need a method to effectively utilize this growing feedback data without compromising the sub-1s latency goal set in ADR-001. Directly querying a large feedback table during runtime is unacceptable.

### **Decision**

We will adopt a **"Retrieval-Augmented Generation-Lite" (RAG-Lite)** approach using vector embeddings and an asynchronous pipeline to enhance the LLM's prompts:

1. **Asynchronous Pipeline (Offline)**: An independent, scheduled ETL (Extract, Transform, Load) task will periodically process new feedback from the Feedback DB.  
2. **Vector Indexing**: The task will use a lightweight **Embedding Model** (e.g., M3E) to convert the Original\_Message into a vector embedding. This vector, along with the User\_Correction, will be stored in an **optimized Vector Index** (e.g., using PGVector or a dedicated vector database).  
3. **Runtime Utilization (Orchestrator)**: When a new translation request (Q) arrives, the Orchestrator will:  
   * Quickly compute the vector of Q.  
   * Query the Vector Index to retrieve the K most **semantically similar** historical feedback examples (Original\_Message\_k, User\_Correction\_k).  
   * Inject these K examples as **Few-Shot context** into the prompt sent to the external LLM, guiding the translation based on user-validated corrections.

### **Consequences (Trade-offs)**

| Type | Impact |
| :---- | :---- |
| **\+ Positive** | **Quality Improvement:** Directly addresses known quality issues (slang, emojis) by immediately leveraging user-corrected translations. |
| **\+ Positive** | **Performance Protection:** Vector retrieval is extremely fast and occurs before the external LLM call, adding negligible latency to the critical path. |
| **\+ Positive** | **Scalability:** The architecture scales independently; the offline vector index can handle large amounts of feedback data without affecting the translation API's performance. |
| **\- Negative** | **Infrastructure Overhead:** Introduces a new dependency (Embedding Model) and requires management of a Vector Index, increasing deployment complexity. |
| **\- Negative** | **Feedback Latency:** There will be a delay (e.g., 24 hours, depending on ETL frequency) between a user submitting feedback and that feedback being reflected in the model's performance. |
| **\! Risk** | **Context Drift:** Poorly embedded or low-quality feedback might lead to the retrieval of irrelevant examples, potentially degrading translation quality. |
| **Mitigation** | Implement basic data validation and filtering in the asynchronous ETL pipeline before indexing. |

