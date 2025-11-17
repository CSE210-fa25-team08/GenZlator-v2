# ADR-006: Adopting React for the Emoji Translator Front-End  

**ADR #:** 006  
**Title:** Adopting React for the Emoji Translator Front-End  
**Date:** 2025-11-10  
**Status:** Approved

---

## 1. Context
Our project, **Emoji Translator**, is a web-based tool that converts text to emojis and vice versa.  
The interface must support:
- **Real-time translation** as users type
- **Dynamic suggestions**
- **Easy swapping** between modes (emoji → text and text → emoji)

While plain HTML, CSS, and JavaScript can achieve this functionality, the **complexity of managing interactive components** will increase significantly as we introduce new features like:
- Favorites and history tracking  
- User preferences  
- Sharing functionality  

This motivates the need for a **scalable, maintainable, and modular** front-end solution.

---

## 2. Decision
We will **use React** to build the front-end interface of the Emoji Translator instead of plain HTML, CSS, and JavaScript.

React offers:
- **Declarative state management** for real-time updates through hooks.
- **Component-based architecture** to isolate logic for input, output, and control elements.
- **Ease of feature expansion** as we add translation history, preferences, and API integrations.
- **Strong developer experience**, including JSX, hot reloading, and integrated debugging tools.
- A **large ecosystem** that provides libraries for routing, state persistence, and styling.

This decision directly addresses the need for **real-time responsiveness, maintainability, and scalability**.

---

## 3. Alternatives Considered

### **Option 1: Vanilla HTML/CSS/JS**
**Pros:**
- Simple setup, minimal tooling or dependencies.  
- Fast to start for small prototypes.

**Cons:**
- Harder to maintain as UI complexity grows (e.g., real-time updates, toggling translation modes).  
- Manual DOM manipulation increases likelihood of bugs.  
- Poor scalability for upcoming features.

---

### **Option 2: Vue**
**Pros:**
- Similar benefits to React (reactivity, components, good tooling).  
- Gentle learning curve.

**Cons:**
- Team’s existing experience and templates are in React.  
- Would require adopting a new build setup and ecosystem.

---

### **Option 3: Svelte**
**Pros:**
- Very lightweight and efficient for real-time UIs.  
- Minimal boilerplate.

**Cons:**
- Smaller ecosystem and fewer reusable components.  
- Less alignment with the team’s existing workflow.

---

## 4. Consequences

### **Positive Outcomes**
- Modular, reusable, and maintainable UI components.  
- Simplified handling of live updates and bidirectional translation.  
- Faster onboarding for developers with React experience.  
- Easier to expand with future features like user settings and API integration.

### **Negative Outcomes**
- Larger initial bundle size compared to vanilla JS.  
- Requires build tooling (Vite, React Scripts) and dependency management.  
- Developers unfamiliar with React need some ramp-up time.

---

## 5. Implementation Notes

- Front-end stack: **React + TypeScript** with **Vite** as the build tool and dev server.
  - Vite is a better fit than Next.js for our current scope because the web-app is small and client-side only. We don’t need Next.js features like SSR/ISR, routing, or file-based APIs, and avoiding them reduces complexity and build times.
  - The original React build tool (**Create React App**) has been deprecated/archived by the React team, so Vite is the modern, actively maintained alternative with faster cold starts, HMR, and simpler configuration.

- Styling approach: **plain CSS** with CSS variables for theming.
  - Using CSS keeps setup simple and avoids introducing a CSS-in-JS runtime for now.
  - We manage light/dark color schemes via `data-theme` on `html` and a small toggle that persists the choice in `localStorage`. CSS variables drive the palette for headers, panels, borders, and text.

- Project layout and tooling highlights:
  - Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
  - Vite configuration kept minimal (`vite.config.ts`) with React plugin.
  - TypeScript configured with separate `tsconfig.app.json` and `tsconfig.node.json` for clarity.
  - Components are organized under `src/components/`; global styles live in `src/index.css`.

- Future considerations:
  - If we later need server-side rendering, static generation, or complex routing, we can reassess Next.js or add a dedicated router to the current Vite setup.
  - If styling needs grow, we can layer on a utility CSS framework (e.g., Tailwind) or a component library without changing the build tool.
