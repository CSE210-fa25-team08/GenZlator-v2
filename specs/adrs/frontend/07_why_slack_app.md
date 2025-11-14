# ADR-007: Why We Chose Slack as the Complementary Platform  

​**ADR #:** 007  
**Title:** Why We Chose Slack as the Complementary Platform  
**Date:** 2025-11-06  
**Status:** Accepted  

---

## 1. Context
We chose Slack as our complementary platform because it enables seamless real-time emoji translation within users’ existing chat workflows. Its built-in bot API and immediate workspace access allow rapid testing and deployment, unlike mobile or third-party platforms requiring complex approvals.

---
​
## 2. Decision
We integrated our Emoji Translator with Slack through a real-time bot that connects to our backend for instant emoji-to-text translation. This approach enables fast deployment, seamless testing within our class workspace, and efficient prototyping without new platform overhead.

---
​
## 3. Alternatives Considered
- **Option 1: Mobile App**  
  **Pros:**  
  - Offers native push notifications and high user engagement  
  - Better access to device features (camera, GPS, etc.)  
  - Great for on-the-go usage  
  - Can store data locally for offline access, allowing limited functionality even without internet connection  

  **Cons:**  
  - High development and maintenance cost for two platforms: iOS & Android  
  - Requires App Store review and application fee for permission and updates  


- **Option 2: Command-Line Tool (CLI)**  
  **Pros:**  
  - Lightweight, fast, and easily automatable  
  - Good for developer-centric workflows  

  **Cons:**  
  - Poor usability for non-technical users  
  - Limited interactivity and visualization options  

 
- **Option 3: Keyboard Extension**  
  **Pros:**  
  - Easily accessible within any app (Messages, Slack, Discord, Instagram, WeChat, etc.)  
  - No need to switch to other apps or websites to use it  
  - Provides a natural and convenient user experience  

  **Cons:**  
  - Complex to deploy and debug  
  - Limited by iOS sandboxing and input security restrictions, since it runs as a keyboard extension  
  - Difficult to integrate with external APIs or databases due to security and privacy constraints  
  - Limited UI space — the keyboard area restricts feature complexity  
  - Requires App Store review and application fee for permission and updates  
  - High development and maintenance cost for both iOS and Android platforms  

---
​
## 4. Consequences
Explain the results and trade-offs.  
- Positive outcomes (benefits): quick testing, real-time translation, easy integration.
- Negative outcomes (risks, costs, complexities): dependency on Slack’s API, limited non-Slack user access.
- How it affects other parts of the system：The Slack bot shares backend logic with the web app, promoting code reuse and unified architecture.

---
​
## 5. Implementation Notes

**Key Components and Libraries**  
- The Slack App consists of two main components: **Frontend** (Home Tab, Modals, Message Blocks, Slash Commands) and **Handler** (backend logic).  
- **Slack Block Kit** is used for UI design, defining message layouts and modals in JSON format.  
- The backend logic (Handler) is implemented with **Node.js**, **JavaScript**, and the official **@slack/bolt** framework.  
- The web and Slack frontends share the same backend API endpoint (`/api/v1/translate`) for translation requests.

**Architecture and Integration**  
- The system is structured into four layers: Frontend, Integration, Backend, and Data.  
- The **Integration Layer** bridges Slack and the backend service, verifying request signatures and converting Slack inputs into API requests.  
- While both Slack and web apps use the same backend, they currently **do not exchange user data directly**, serving separate user flows.

**Rollout and Testing Plan**  
- The initial implementation focuses on **Slack App Home**, **Modals**, and **Slash Commands** for core interaction.  
- Modals allow configuration of user preferences (e.g., style settings), while Slash Commands handle real-time translation.  
- Early prototypes are limited to internal testing for feasibility validation before public rollout.

**Monitoring and Fallback**  
- Testing focuses on verifying event handling, command accuracy, and modal interactions within Slack.  
- Since it’s integrated within the class workspace, errors can be debugged quickly without external deployment risks.

---
​
## 6. References
- [Slack Web API Doc](https://docs.slack.dev/apis/web-api/)
- [Slack Slash Commands Doc](https://docs.slack.dev/interactivity/implementing-slash-commands/)
- [Slack Modals Doc](https://docs.slack.dev/surfaces/modals/)
- [Slack App Home Page Doc](https://docs.slack.dev/surfaces/app-home/)
- [Slack Shortcuts Doc](https://docs.slack.dev/interactivity/implementing-shortcuts)
