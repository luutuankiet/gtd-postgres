import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../types';

// Define the drag item type
const ITEM_TYPE = 'TAB';

interface DragItem {
  type: string;
  taskId: string;
  paneId: string;
}

interface DraggableTabProps {
  task: Task;
  paneId: string;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onMove: (taskId: string, sourcePaneId: string, targetPaneId: string) => void;
}

const DraggableTab: React.FC<DraggableTabProps> = ({
  task,
  paneId,
  isActive,
  onActivate,
  onClose,
  onMove
}) => {
  // Set up the drag source
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { type: ITEM_TYPE, taskId: task.id, paneId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Set up the drop target
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: DragItem) => {
      if (item.paneId !== paneId) {
        onMove(item.taskId, item.paneId, paneId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  // Combine drag and drop refs
  const ref = (node: HTMLDivElement) => {
    drag(node);
    drop(node);
  };
  
  return (
    <div 
      ref={ref}
      className={`pane-tab ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
      onClick={onActivate}
    >
      <span>{task.title}</span>
      <button 
        className="close-tab"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DraggableTab;
