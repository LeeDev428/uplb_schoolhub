Here is my existing codebase for context. The project follows a modular monolithic architecture, where backend, frontend, and role-based modules are organized into separate folders for better structure, maintainability, and clarity.

You must strictly follow the existing project structure. Do not restructure folders unless absolutely necessary.

When implementing the feature:

1. Follow a systematic implementation flow:
- Start with database design (schema and migrations)
- Then backend logic (models, repositories/services, controllers, APIs)
- Then frontend integration

2. Apply industry best practices:
- Use clean, readable, and maintainable code
- Follow SOLID principles where applicable
- Apply proper separation of concerns
- Avoid duplicated or redundant logic
- Follow the existing coding conventions in the project

3. Security requirements:

- Use secure authentication and authorization patterns
- Validate and sanitize all inputs
- Prevent common vulnerabilities (SQL injection, XSS, CSRF, etc.)
- Use proper middleware/guards where needed
- Never expose sensitive data in responses
- Apply least-privilege principles

4. Performance and optimization:

- Use efficient queries (avoid N+1 problems)
- Apply indexing where appropriate
- Optimize API responses (no unnecessary payloads)
- Avoid unnecessary re-renders on frontend
- Use lazy loading or pagination where applicable

5. Scalability and maintainability:

- Write modular and reusable functions
- Ensure the code can scale if the system grows
- Keep components loosely coupled
- Avoid overengineering, but design with future expansion in mind

6. Keep it simple:

- Do not overcomplicate the solution
- Only implement what is required
- No unnecessary abstractions

Focus on writing production-ready code that is secure, optimized, scalable, and easy to maintain long-term.

