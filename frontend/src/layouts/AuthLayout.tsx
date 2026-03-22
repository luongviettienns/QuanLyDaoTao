import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,hsl(42_45%_97%)_0%,hsl(35_38%_95%)_46%,hsl(210_42%_96%)_100%)] dark:bg-[linear-gradient(135deg,hsl(224_28%_10%)_0%,hsl(223_24%_12%)_52%,hsl(219_30%_14%)_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(248,250,252,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.05)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_68%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-20 size-80 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-12 size-96 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(96,165,250,0.12),transparent_72%)]" />
      <Outlet />
    </main>
  )
}
