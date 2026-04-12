III.2 General requirements
Building an entire project is complicated, and many things can go wrong. To help you,
we will provide a list of general requirements that you must follow. If you don’t follow
them, your project will be rejected.
The requirements are the following:
• The project must be a web application, and requires a frontend, backend, and a
database.
• Git must be used with clear and meaningful commit messages. The repository must
show:
◦ Commits from all team members.
◦ Clear commit messages describing the changes.
◦ Proper work distribution across the team.
• Deployment must use a containerization solution (Docker, Podman, or equivalent) and run with a single command.
• Your website must be compatible with the latest stable version of Google Chrome.
• No warnings or errors should appear in the browser console.
• The project must include accessible Privacy Policy and Terms of Service pages
with relevant content.
Privacy Policy and Terms of Service: These pages will be verified
during evaluation. They must:
• Be easily accessible from the application (e.g., footer links).
• Contain relevant and appropriate content for your project.
• Not be placeholder or empty pages.
Missing or inadequate Privacy Policy/Terms of Service pages will
result in project rejection.
Multi-user Support (Mandatory): Your website must support multiple
users simultaneously. This is a core requirement of the project.
Users should be able to interact with the application at the same
time without conflicts or performance issues. This includes:
• Multiple users can be logged in and active at the same time.
• Concurrent actions by different users are handled properly.
• Real-time updates are reflected across all connected users when
applicable.
• No data corruption or race conditions occur with simultaneous
user actions.
8
ft_transcendence Surprise.
III.3 Technical requirements
This section, like the previous one, is mandatory. You will then be able to choose the
modules you want to use in the next chapter.
• A frontend that is clear, responsive, and accessible across all devices.
• Use a CSS framework or styling solution of your choice (e.g., Tailwind CSS,
Bootstrap, Material-UI, Styled Components, etc.).
• Store credentials (API keys, environment variables, etc.) in a local .env file that is
ignored by Git, and provide an .env.example file.
• The database must have a clear schema and well-defined relations.
• Your application must have a basic user management system. Users must be
able to sign up and log in securely:
◦ At minimum: email and password authentication with proper security (hashed
passwords, salted, etc.).
◦ Additional authentication methods (OAuth, 2FA, etc.) can be implemented
via modules.
• All forms and user inputs must be properly validated in both the frontend and
backend.
• For the backend, HTTPS must be used everywhere.
What is a Framework? For this project, a framework is defined as a
comprehensive tool that provides:
• A structured architecture and conventions for organizing code.
• Built-in features for common tasks (routing, state management,
etc.).
• A complete ecosystem of tools and libraries.
Examples:
• Frontend frameworks: React, Vue, Angular, Svelte, Next.js
(these are frameworks).
• Backend frameworks: Express, Fastify, NestJS, Django, Flask,
Ruby on Rails.
• Not frameworks: jQuery (library), Lodash (utility library),
Axios (HTTP client).
Note: React is considered a framework in this context due to its
ecosystem and architectural patterns, even though it is technically a
library.