export function QuoteEditorPage() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <h1>Quoting Tool MVP</h1>
      <p>Verification/hardening status page for the current scaffold.</p>
      <ul>
        <li>Backend: Express scaffold routes are present.</li>
        <li>API: Quote/Part/Pricing endpoints are wired for MVP flow checks.</li>
        <li>Schema: Prisma schema and SQL migration files are in repo.</li>
        <li>Tests: Backend/frontend Vitest suites are included.</li>
      </ul>
    </main>
  );
}
