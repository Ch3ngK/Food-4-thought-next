'use client';

interface HeaderProps {
  stats: { total: number; visited: number };
  username: string | null;
}

export default function Header({ stats, username }: HeaderProps) {
  return (
    <header>
      <h1>🍜 Food Trail</h1>
      <div className="HeaderBox">
        <h2>Overview</h2>
        <p>Hello, {username ? username : 'Guest'}</p>
        <p>
          {stats.total > stats.visited ? (
            <>You still have <strong>{stats.total - stats.visited}</strong> spots to try!</>
          ) : (
            "You've visited all the spots!"
          )}
        </p>
      </div>
    </header>
  );
}
