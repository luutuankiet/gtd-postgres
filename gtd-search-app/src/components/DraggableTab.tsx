import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '../types';

// Define the item type constant
export const ITEM_TYPE = 'TAB';

// Define the drag item interface
export interface DragItem {
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
  // Create a ref
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up drag source
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      console.log(`Started dragging task ${task.id} from pane ${paneId}`);
      return { type: ITEM_TYPE, taskId: task.id, paneId };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('Drag ended', item, dropResult);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect the drag ref to our element ref
  dragRef(ref);

  return (
    <div 
      ref={ref}
      className={`pane-tab ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onActivate}
      style={{ opacity: isDragging ? 0.5 : 1 }}
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
