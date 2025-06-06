'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './LocationInput.css';

export default function LocationInput() {
  const [title, setTitle] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.append('location', title);

    // Navigate with the updated query params
    router.push(`/food-trail?${updatedParams.toString()}`);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="food-input-form">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter food location"
        className="food-input"
      />
      <button className="add-button-2" type="submit">
        Add
      </button>
    </form>
  );
}

