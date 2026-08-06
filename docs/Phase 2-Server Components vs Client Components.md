In Next.js, components are Server Components by default:

Run on the server only
Never ship JavaScript to browser
Can directly access databases, APIs, secrets
Can't use state, effects, or browser APIs


To make a component interactive, add "use client":

Runs in the browser
CAN use state, effects, events
CAN'T access databases directly

Key Differences
Feature	Server Component	Client Component
Where it runs	Server only	Browser
JavaScript shipped to browser	❌ No	✅ Yes
Can use async/await	✅ Yes	❌ No (use useEffect)
Can access database	✅ Yes	❌ No
Can use useState	❌ No	✅ Yes
Can use onClick, events	❌ No	✅ Yes
Page load speed	⚡ Fast	📦 Heavier

