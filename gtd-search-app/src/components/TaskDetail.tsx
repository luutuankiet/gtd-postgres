import React from 'react';
import { Task } from '../types';

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  if (!task) {
    return null;
  }
  
  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h2>{task.title}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="task-detail-meta">
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span className={`meta-value status-${task.status}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Priority:</span>
          <span className={`meta-value priority-${task.priority}`}>
            {task.priority}
          </span>
        </div>
        
        {task.dueDate && (
          <div className="meta-item">
            <span className="meta-label">Due Date:</span>
            <span className="meta-value">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        <div className="meta-item">
          <span className="meta-label">Folder:</span>
          <span className="meta-value">{task.folder}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">List:</span>
          <span className="meta-value">{task.list}</span>
        </div>
      </div>
      
      <div className="task-detail-content">
        <h3>Description</h3>
        <div className="content-body">
          {task.content}
        </div>
      </div>
      
      <div className="task-detail-tags">
        <h3>Tags</h3>
        <div className="tags-list">
          {task.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="task-detail-dates">
        <div className="date-item">
          <span className="date-label">Created:</span>
          <span className="date-value">
            {new Date(task.createdAt).toLocaleString()}
          </span>
        </div>
        
        <div className="date-item">
          <span className="date-label">Updated:</span>
          <span className="date-value">
            {new Date(task.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
