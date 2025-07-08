'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/app/supabaseClient';

export default function Header() {
  const [name, setName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, visited: 0 });
  const searchParams = useSearchParams();

  const allLocations = searchParams.getAll('location');
  const pending = allLocations.length; 

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('food_trail_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: visitedCount } = await supabase
        .from('food_trail_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('visited', true);

      setStats({
        total: count || 0,
        visited: visitedCount || 0
      });
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (user) {
        const fetchedUsername = user.user_metadata?.username || user.email;
        setUsername(fetchedUsername);
      }
    };

    fetchUser();
  }, []);


  /** const handleNameClick = () => {
    const input = prompt("What is your name?");
    if (input) setName(input);
  };
  */

  return (
    <header>
      <h1>🍜 Food Trail</h1>
      <div className="HeaderBox">
        <h2>Overview</h2>
        <p>
          Hello, {username ? username : 'Guest'}
        </p>
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

