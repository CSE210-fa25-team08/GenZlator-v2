# ADR-005: Choice of Programming Language for Slack App Backend (Python FastAPI vs. JavaScript)

**ADR #:** 005
**Title:** Choice of Programming Language for Slack App Backend (Python FastAPI vs. JavaScript)
**Date:** 2025-11-10
**Status:** Accepted

---

## 1. Context

Our system includes both a web application and a Slack application that provide complementary user interfaces for the same translation service.
The frontend group is responsible for maintaining both the web frontend and the Slack app server.

Since the web frontend is built with JavaScript or TypeScript, the team evaluated whether to use the same language for the Slack backend or to adopt Python (FastAPI). During the early exploration phase, a prototype Slack app was implemented in FastAPI to test feasibility.

---

## 2. Decision

We decided to implement the **Slack application backend in JavaScript (Node.js)** using **Slack’s official Bolt framework**.

---

## 3. Alternatives Considered

-   **Option 1: JavaScript (Bolt for Node.js)**

    -   **Pros:**

        -   Officially recommended by Slack and best supported by its API documentation.
        -   Uses the same language and tools as the web frontend, enabling the frontend team to maintain both components.
        -   Natural fit for asynchronous and event-driven Slack interactions.
        -   Large community support and active updates.

    -   **Cons:**

        -   Need to rebuild from scratch.

-   **Option 2: Python (FastAPI)**

    -   **Pros:**

        -   Was used during the early phase of testing the Slack app’s feasibility, so basic endpoints and verification logic already exist.
        -   Straightforward to integrate with REST-style API endpoints.

    -   **Cons:**

        -   Different language ad toolchain from the frontend team’s main stack.
        -   Slack’s Python SDK is less feature-rich and has fewer up-to-date examples.

---

## 4. Consequences

Positive:

-   Unified development environment for both web and Slack app components.
-   Strong SDK and documentation support directly from Slack.
-   Simplified collaboration within the frontend group.

Negative:

-   Requires rewriting the early FastAPI prototype into Node.js using the Bolt SDK.

Overall, the benefits of maintainability, developer efficiency, and official support outweigh the short-term migration effort.

---

## 5. Implementation Notes

-   Use **@slack/bolt** for event handling, slash commands, and modals.
-   Deploy the Slack app as an independent Node.js service managed by the frontend team.
-   Secure all Slack tokens and secrets via environment variables.
-   Integrate deployment within the same npm-based CI/CD pipeline as the web frontend.

---

## 6. References

-   [Slack API Documentation – Bolt for JavaScript](https://slack.dev/bolt-js/tutorial/getting-started)
-   [Slack API: Interactivity & Shortcuts](https://api.slack.com/interactivity)
