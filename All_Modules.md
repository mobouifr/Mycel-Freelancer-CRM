## Chapter IV — Modules

You will need to earn 14 points in total to complete your project. Each major module is worth 2 points, and each minor module is worth 1 point.

Categories available (you may choose multiple modules from any category):
- Web
- Accessibility and Internationalization
- User Management
- Artificial Intelligence
- Cybersecurity
- Gaming and user experience
- Devops
- Data and Analytics
- Blockchain
- Modules of choice

We strongly recommend choosing modules only after your ideas are clear and you have a good understanding of what you want to build.

Additionally, aiming for more than 14 points in total may be a good idea, especially if some modules aren't validated during the evaluation.

WARNING — Important: Module Dependencies and Evaluation:
- Some modules require other modules to be implemented first (marked with info notes).
- Gaming modules (AI Opponent, Tournament, Game customization, Spectator mode, Multiplayer 3+, Add another game) require that at least one game be implemented first.
- The Game Statistics module requires that a game be implemented.
- Advanced chat features require the basic chat functionality from the "User interaction" module.
- SSR is incompatible with the ICP blockchain backend.
- Plan your modules carefully to ensure they work together coherently!
- During evaluation: You will be asked to demonstrate each claimed module. Only fully functional and properly implemented modules will be counted toward your final score. Non-functional or incomplete modules = 0 points.

---

### IV.1 Web

- **MAJOR**: Use a framework for both the frontend and backend.
  - Use a frontend framework (React, Vue, Angular, Svelte, etc.).
  - Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails, etc.).
  - Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use both their frontend and backend capabilities.
- **MINOR**: Use a frontend framework (React, Vue, Angular, Svelte, etc.).
- **MINOR**: Use a backend framework (Express, Fastify, NestJS, Django, etc.).
- **MAJOR**: Implement real-time features using WebSockets or similar technology.
  - Real-time updates across clients.
  - Handle connection/disconnection gracefully.
  - Efficient message broadcasting.
- **MAJOR**: Allow users to interact with other users. The minimum requirements are:
  - A basic chat system (send/receive messages between users).
  - A profile system (view user information).
  - A friends system (add/remove friends, see friends list).
- **MAJOR**: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:
  - GET /api/{something}
  - POST /api/{something}
  - PUT /api/{something}
  - DELETE /api/{something}
- **MINOR**: Use an ORM for the database.
- **MINOR**: A complete notification system for all creation, update, and deletion actions.
- **MINOR**: Real-time collaborative features (shared workspaces, live editing, collaborative drawing, etc.).
- **MINOR**: Server-Side Rendering (SSR) for improved performance and SEO.
- **MINOR**: Progressive Web App (PWA) with offline support and installability.
- **MINOR**: Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components).
- **MINOR**: Implement advanced search functionality with filters, sorting, and pagination.
- **MINOR**: File upload and management system.
  - Support multiple file types (images, documents, etc.).
  - Client-side and server-side validation (type, size, format).
  - Secure file storage with proper access control.
  - File preview functionality where applicable.
  - Progress indicators for uploads.
  - Ability to delete uploaded files.

---

### IV.2 Accessibility and Internationalization

- **MAJOR**: Complete accessibility compliance (WCAG 2.1 AA) with screen reader support, keyboard navigation, and assistive technologies.
- **MINOR**: Support for multiple languages (at least 3 languages).
  - Implement i18n (internationalization) system.
  - At least 3 complete language translations.
  - Language switcher in the UI.
  - All user-facing text must be translatable.
- **MINOR**: Right-to-left (RTL) language support.
  - Support for at least one RTL language (Arabic, Hebrew, etc.).
  - Complete layout mirroring (not just text direction).
  - RTL-specific UI adjustments where needed.
  - Seamless switching between LTR and RTL.
- **MINOR**: Support for additional browsers.
  - Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).
  - Test and fix all features in each browser.
  - Document any browser-specific limitations.
  - Consistent UI/UX across all supported browsers.

---

### IV.3 User Management

- **MAJOR**: Standard user management and authentication.
  - Users can update their profile information.
  - Users can upload an avatar (with a default avatar if none provided).
  - Users can add other users as friends and see their online status.
  - Users have a profile page displaying their information.
- **MINOR**: Game statistics and match history (requires a game module).
  - Track user game statistics (wins, losses, ranking, level, etc.).
  - Display match history (1v1 games, dates, results, opponents).
  - Show achievements and progression.
  - Leaderboard integration.
  - INFO: This module requires you to have implemented at least one game. You cannot claim this module without a functional game.
- **MINOR**: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).
- **MAJOR**: Advanced permissions system:
  - View, edit, and delete users (CRUD).
  - Roles management (admin, user, guest, moderator, etc.).
  - Different views and actions based on user role.
- **MAJOR**: An organization system:
  - Create, edit, and delete organizations.
  - Add users to organizations.
  - Remove users from organizations.
  - View organizations and allow users to perform specific actions within an organization (minimum: create, read, update).
- **MINOR**: Implement a complete 2FA (Two-Factor Authentication) system for the users.
- **MINOR**: User activity analytics and insights dashboard.

---

### IV.4 Artificial Intelligence

- **MAJOR**: Introduce an AI Opponent for games.
  - The AI must be challenging and able to win occasionally.
  - The AI should simulate human-like behavior (not perfect play).
  - If you implement game customization options, the AI must be able to use them.
  - You must be able to explain your AI implementation during evaluation.
  - INFO: This module requires you to have implemented at least one game. The AI must be able to play your game competently.
- **MAJOR**: Implement a complete RAG (Retrieval-Augmented Generation) system.
  - Interact with a large dataset of information.
  - Users can ask questions and get relevant answers.
  - Implement proper context retrieval and response generation.
- **MAJOR**: Implement a complete LLM system interface.
  - Generate text and/or images based on user input.
  - Handle streaming responses properly.
  - Implement error handling and rate limiting.
- **MAJOR**: Recommendation system using machine learning.
  - Personalized recommendations based on user behavior.
  - Collaborative filtering or content-based filtering.
  - Continuously improve recommendations over time.
- **MINOR**: Content moderation AI (auto moderation, auto deletion, auto warning, etc.)
- **MINOR**: Voice/speech integration for accessibility or interaction.
- **MINOR**: Sentiment analysis for user-generated content.
- **MINOR**: Image recognition and tagging system.

---

### IV.5 Cybersecurity

- **MAJOR**: Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets:
  - Configure strict ModSecurity/WAF.
  - Manage secrets in Vault (API keys, credentials, environment variables), encrypted and isolated.

---

### IV.6 Gaming and user experience

- **MAJOR**: Implement a complete web-based game where users can play against each other.
  - The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card games, etc.).
  - Players must be able to play live matches.
  - The game must have clear rules and win/loss conditions.
  - The game can be 2D or 3D.
- **MAJOR**: Remote players — Enable two players on separate computers to play the same game in real-time.
  - Handle network latency and disconnections gracefully.
  - Provide a smooth user experience for remote gameplay.
  - Implement reconnection logic.
- **MAJOR**: Multiplayer game (more than two players).
  - Support for three or more players simultaneously.
  - Fair gameplay mechanics for all participants.
  - Proper synchronization across all clients.
  - INFO: This module requires you to have implemented at least one game. You're extending your game to support three or more players.
- **MAJOR**: Add another game with user history and matchmaking.
  - Implement a second distinct game.
  - Track user history and statistics for this game.
  - Implement a matchmaking system.
  - Maintain performance and responsiveness.
  - INFO: This module requires you to have already implemented a first game. You cannot claim this module without having a functional first game.
- **MAJOR**: Implement advanced 3D graphics using a library like Three.js or Babylon.js.
  - Create an immersive 3D environment.
  - Implement advanced rendering techniques.
  - Ensure smooth performance and user interaction.
- **MINOR**: Advanced chat features (enhances the basic chat from "User interaction" module).
  - Ability to block users from messaging you.
  - Invite users to play games directly from chat.
  - Game/tournament notifications in chat.
  - Access to user profiles from chat interface.
  - Chat history persistence.
  - Typing indicators and read receipts.
  - INFO: This module enhances the basic chat system from the "Allow users to interact" module. You cannot claim this module without having implemented the basic chat first.
- **MINOR**: Implement a tournament system.
  - Clear matchup order and bracket system.
  - Track who plays against whom.
  - Matchmaking system for tournament participants.
  - Tournament registration and management.
  - INFO: This module requires you to have implemented at least one game. You cannot have tournaments without a game to play.
- **MINOR**: Game customization options.
  - Power-ups, attacks, or special abilities.
  - Different maps or themes.
  - Customizable game settings.
  - Default options must be available.
  - INFO: This module requires you to have implemented at least one game. You're adding customization to an existing game.
- **MINOR**: A gamification system to reward users for their actions.
  - Implement at least 3 of the following: achievements, badges, leaderboards, XP/level system, daily challenges, rewards.
  - System must be persistent (stored in database).
  - Visual feedback for users (notifications, progress bars, etc.).
  - Clear rules and progression mechanics.
  - INFO: While this is a Minor module (1 point), implementing a complete gamification system can be substantial. Focus on quality over quantity — three well-implemented features are better than six poorly done ones.
- **MINOR**: Implement spectator mode for games.
  - Allow users to watch ongoing games.
  - Real-time updates for spectators.
  - Optional: spectator chat.
  - INFO: This module requires you to have implemented at least one game. Spectators need a game to watch.

---

### IV.7 Devops

- **MAJOR**: Infrastructure for log management using ELK (Elasticsearch, Logstash, Kibana).
  - Elasticsearch to store and index logs.
  - Logstash to collect and transform logs.
  - Kibana for visualization and dashboards.
  - Implement log retention and archiving policies.
  - Secure access to all components.
- **MAJOR**: Monitoring system with Prometheus and Grafana.
  - Set up Prometheus to collect metrics.
  - Configure exporters and integrations.
  - Create custom Grafana dashboards.
  - Set up alerting rules.
  - Secure access to Grafana.
- **MAJOR**: Backend as microservices.
  - Design loosely-coupled services with clear interfaces.
  - Use REST APIs or message queues for communication.
  - Each service should have a single responsibility.
- **MINOR**: Health check and status page system with automated backups and disaster recovery procedures.

---

### IV.8 Data and Analytics

- **MAJOR**: Advanced analytics dashboard with data visualization.
  - Interactive charts and graphs (line, bar, pie, etc.).
  - Real-time data updates.
  - Export functionality (PDF, CSV, etc.).
  - Customizable date ranges and filters.
- **MINOR**: Data export and import functionality.
  - Export data in multiple formats (JSON, CSV, XML, etc.).
  - Import data with validation.
  - Bulk operations support.
- **MINOR**: GDPR compliance features.
  - Allow users to request their data.
  - Data deletion with confirmation.
  - Export user data in a readable format.
  - Confirmation emails for data operations.

---

### IV.9 Blockchain

- **MAJOR**: Store tournament scores on the Blockchain.
  - Use Avalanche and Solidity smart contracts on a test blockchain.
  - Implement smart contracts to record, manage, and retrieve tournament scores.
  - Ensure data integrity and immutability.
- **MINOR**: Use ICP (Internet Computer Protocol) for a backend that runs on a blockchain (incompatible with SSR).

---

### IV.10 Modules of choice

- **MAJOR**: Implement a custom module that is not listed above.
  - The module must be substantial and demonstrate technical complexity.
  - You must provide proper justification in your README.md explaining:
    - Why you chose this module.
    - What technical challenges it addresses.
    - How it adds value to your project.
    - Why it deserves Major module status (2 points).
  - Taking shortcuts or implementing trivial features will result in rejection.
  - Be creative and think outside the box.
  - The module should be relevant to your project context.
- **MINOR**: Same as the major module but smaller in scope and less complex.
  - Must still demonstrate technical skill and creativity.
  - Should add meaningful value to your project.
  - Requires justification in README.md (similar to Major, but for 1 point).
