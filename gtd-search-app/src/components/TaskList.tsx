import React from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onTaskSelect: (task: Task) => void;
  disabledTaskIds?: string[]; // Tasks that are already open
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  loading, 
  onTaskSelect,
  disabledTaskIds = []
}) => {
  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }
  
  if (tasks.length === 0) {
    return <div className="no-results">No tasks found matching your criteria.</div>;
  }
  
  return (
    <div className="task-list">
      {tasks.map(task => {
        const isDisabled = disabledTaskIds.includes(task.id);
        
        return (
          <div 
            key={task.id} 
            className={`task-item ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && onTaskSelect(task)}
          >
            <div className="task-title">
              {task.title}
              {isDisabled && <span className="open-indicator">Already open</span>}
            </div>
            <div className="task-meta">
              <span className={`status status-${task.status}`}>{task.status}</span>
              <span className={`priority priority-${task.priority}`}>{task.priority}</span>
              {task.dueDate && (
                <span className="due-date">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
