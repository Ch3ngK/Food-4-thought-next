'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Header() {
  const [name, setName] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const allLocations = searchParams.getAll('location');
  const pending = allLocations.length; 

  const handleNameClick = () => {
    const input = prompt("What is your name?");
    if (input) setName(input);
  };

  return (
    <header>
      <h1>🍜 Food Trail</h1>
      <div className="HeaderBox">
        <h2>Overview</h2>
        <p>
          Hello,{" "}
          <strong role="button" onClick={handleNameClick}>
            {name ?? "Guest"}
          </strong>
        </p>
        <p>
          {pending > 0 ? (
            <>You still have <strong>{pending}</strong> spots to try!</>
          ) : (
            "You've visited all the spots!"
          )}
        </p>
      </div>
    </header>
  );
}

