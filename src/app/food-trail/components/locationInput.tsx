'use client';

import { useState, FormEvent } from 'react';
import './LocationInput.css';

export default function LocationInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
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

