import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in_progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };
  
  return (
    <div className="task-item" onClick={() => onClick(task)}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-meta">
          <span className={`task-priority priority-${task.priority}`}>
            {task.priority}
          </span>
          <span className={`task-status status-${task.status.replace('_', '-')}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="task-content">
        <p>{task.content.length > 100 ? `${task.content.substring(0, 100)}...` : task.content}</p>
      </div>
      
      <div className="task-footer">
        <div className="task-location">
          <span className="task-folder">{task.folder}</span>
          <span className="task-list">{task.list}</span>
        </div>
        
        {task.dueDate && (
          <div className="task-due-date">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
        
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="task-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
