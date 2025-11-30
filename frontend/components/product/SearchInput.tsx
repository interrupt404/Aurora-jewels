'use client';
import React, { useState } from 'react';

interface SearchInputProps {
  onSearch: (q: string) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [value, setValue] = useState('');

  return (
    <div className="relative">
      {/* icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search products, e.g. diamond pendant"
        className="w-full rounded-full bg-white border border-neutral-200 shadow-sm px-12 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300"
      />
    </div>
  );
}
