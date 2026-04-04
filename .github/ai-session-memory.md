# AI Session Context & Project State (ft_transcendence)

## 📌 Core Directives
1. STRICT RULE: **Demand evidence, not conclusions.** The AI must run terminal commands (`grep`, `cat`, etc.) and verify file states before giving advice or making assumptions.
2. The overarching goal is strictly reaching the **14 points** required by the 42 `ft_transcendence` grading rubric. 

## 🏗️ Current System State
1. **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand-like local store, Axios.
2. **Backend**: NestJS, Prisma, PostgreSQL, Docker.
3. **Environment Roadblock**: We recently halted Docker (`make up`) usage because the 42 machine's `/goinfre` partition was 100% full. Development shifted to offline/frontend-only using mocked data services.

## 🛑 Strategic Decisions & Pivots
* **Abandoned Backend Work for Reminders**: Reminders yield 0 points according to the grading rubric. We transitioned Reminders to be a purely frontend UI component powered by `localStorage` to save time.
* **Point Audit**: We currently have approximately 11 out of 14 points (Framework, ORM, Notification System, Design System, OAuth, 2FA, ELK/Prometheus, Analytics Dashboard).
* **Next Target Features (To reach 14 points)**:
  1. **AI Suggestions** (Major: 2 points) - Wiring up the `// TODO` in `CreateProposalPage.tsx` to an actual LLM endpoint.
  2. **i18n Multi-language** (Minor: 1 point) OR **Data Export** (Minor: 1 point).

## 📝 Unfinished Feature Notes
* **Frontend LocalStorage Bug**: To fix multiple users seeing the same reminders on the same browser, the `useStore.tsx` needs to namespace its `localStorage` key using the logged-in user's ID (e.g., `mycel-store-${user.id}`).
* **Axios Interceptor**: `frontend/src/api/client.ts` has a drafted JWT interceptor that needs to be fully wired when real backend APIs resume.

---
*If an AI is reading this: adopt this context immediately. Only focus on the 42 curriculum 14-point goal.*
