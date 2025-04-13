import React from 'react';
import { SearchParams, SearchFilters } from '../types';
import { folders, lists, tags } from '../data/dummyData';

interface FilterPanelProps {
  searchParams: SearchParams;
  onFilterChange: (filters: SearchFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ searchParams, onFilterChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentStatuses = searchParams.filters.status || [];
    
    const newStatuses = e.target.checked
      ? [...currentStatuses, value]
      : currentStatuses.filter(status => status !== value);
    
    onFilterChange({
      ...searchParams.filters,
      status: newStatuses
    });
  };
  
  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentPriorities = searchParams.filters.priority || [];
    
    const newPriorities = e.target.checked
      ? [...currentPriorities, value]
      : currentPriorities.filter(priority => priority !== value);
    
    onFilterChange({
      ...searchParams.filters,
      priority: newPriorities
    });
  };
  
  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...searchParams.filters,
      folder: e.target.value || undefined
    });
  };
  
  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...searchParams.filters,
      list: e.target.value || undefined
    });
  };
  
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...searchParams.filters,
      dateFrom: e.target.value || undefined
    });
  };
  
  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...searchParams.filters,
      dateTo: e.target.value || undefined
    });
  };
  
  return (
    <div className="filter-panel">
      <h3>Filters</h3>
      
      <div className="filter-section">
        <h4>Status</h4>
        <div>
          <label>
            <input
              type="checkbox"
              value="pending"
              checked={searchParams.filters.status?.includes('pending') || false}
              onChange={handleStatusChange}
            />
            Pending
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              value="in_progress"
              checked={searchParams.filters.status?.includes('in_progress') || false}
              onChange={handleStatusChange}
            />
            In Progress
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              value="completed"
              checked={searchParams.filters.status?.includes('completed') || false}
              onChange={handleStatusChange}
            />
            Completed
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Priority</h4>
        <div>
          <label>
            <input
              type="checkbox"
              value="low"
              checked={searchParams.filters.priority?.includes('low') || false}
              onChange={handlePriorityChange}
            />
            Low
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              value="medium"
              checked={searchParams.filters.priority?.includes('medium') || false}
              onChange={handlePriorityChange}
            />
            Medium
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              value="high"
              checked={searchParams.filters.priority?.includes('high') || false}
              onChange={handlePriorityChange}
            />
            High
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Folder</h4>
        <select 
          value={searchParams.filters.folder || ''} 
          onChange={handleFolderChange}
        >
          <option value="">All Folders</option>
          {folders.map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <h4>List</h4>
        <select 
          value={searchParams.filters.list || ''} 
          onChange={handleListChange}
        >
          <option value="">All Lists</option>
          {lists.map(list => (
            <option key={list} value={list}>{list}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <h4>Due Date</h4>
        <div>
          <label>
            From:
            <input
              type="date"
              value={searchParams.filters.dateFrom || ''}
              onChange={handleDateFromChange}
            />
          </label>
        </div>
        <div>
          <label>
            To:
            <input
              type="date"
              value={searchParams.filters.dateTo || ''}
              onChange={handleDateToChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;