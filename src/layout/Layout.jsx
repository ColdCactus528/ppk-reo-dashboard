import { Link, Outlet, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const items = [
    { path: "/dashboard", label: "Дашборд" },
    { path: "/registry", label: "Картотека" },
  ];

  return (
    <aside className="w-64 shrink-0 p-4 border-r border-eco-border bg-white">
      <div className="mb-6">
        <div className="text-lg font-semibold">ППК РЭО</div>
        <div className="text-eco-mute text-sm">Экологический оператор</div>
      </div>
      <nav className="space-y-1">
        {items.map((i) => (
          <Link
            key={i.path}
            to={i.path}
            className={`block px-3 py-2 rounded-lg transition ${
              location.pathname === i.path
                ? "bg-eco-green/20"
                : "hover:bg-eco-blue/20 text-eco-mute"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-eco-bg text-eco-text flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Экосистема обращения с отходами
          </h1>
          <div className="text-sm text-eco-mute">demo • eco data-driven</div>
        </header>
        <section className="space-y-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
