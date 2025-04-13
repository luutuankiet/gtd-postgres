import React, { useState } from 'react';
import { SearchParams } from '../types';

interface SearchBarProps {
  searchParams: SearchParams;
  onSearchChange: (params: SearchParams) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchParams, onSearchChange }) => {
  const [query, setQuery] = useState(searchParams.query);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange({
      ...searchParams,
      query
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // For immediate search as you type
    onSearchChange({
      ...searchParams,
      query: e.target.value
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search tasks..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
