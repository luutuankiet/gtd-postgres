import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import DraggableTab, { ITEM_TYPE, DragItem } from './DraggableTab';
import TaskDetail from './TaskDetail';
import { Task, PaneGroup as PaneGroupType } from '../types';

interface PaneGroupComponentProps {
  paneGroup: PaneGroupType;
  tasks: Task[];
  getTaskById: (id: string) => Task | null;
  onCloseTask: (taskId: string) => void;
  onMoveTask: (taskId: string, sourcePaneId: string, targetPaneId: string) => void;
  onSetActiveTask: (taskId: string, paneId: string) => void;
}

const PaneGroupComponent: React.FC<PaneGroupComponentProps> = ({
  paneGroup,
  tasks,
  getTaskById,
  onCloseTask,
  onMoveTask,
  onSetActiveTask
}) => {
  // Create a ref for the drop target
  const dropRef = useRef<HTMLDivElement>(null);
  
  // Set up drop target for empty pane area
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ITEM_TYPE,
    drop: (item) => {
      console.log(`Dropping task ${item.taskId} from pane ${item.paneId} to pane ${paneGroup.id}`);
      if (item.paneId !== paneGroup.id) {
        onMoveTask(item.taskId, item.paneId, paneGroup.id);
      }
      // Don't return anything (or return undefined)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  // Connect the drop ref
  drop(dropRef);
  
  return (
    <div className="pane-group">
      <div className="pane-tabs">
        {paneGroup.taskIds.map(taskId => {
          const task = getTaskById(taskId);
          if (!task) return null;
          
          return (
            <DraggableTab
              key={taskId}
              task={task}
              paneId={paneGroup.id}
              isActive={paneGroup.activeTaskId === taskId}
              onActivate={() => onSetActiveTask(taskId, paneGroup.id)}
              onClose={() => onCloseTask(taskId)}
              onMove={onMoveTask}
            />
          );
        })}
      </div>
      
      <div 
        ref={dropRef}
        className={`pane-content ${isOver ? 'drop-target' : ''}`}
        style={{
          backgroundColor: isOver ? 'rgba(66, 153, 225, 0.2)' : undefined,
          border: isOver ? '2px dashed #4299e1' : undefined
        }}
      >
        {paneGroup.activeTaskId ? (
          <TaskDetail 
            task={getTaskById(paneGroup.activeTaskId)} 
            onClose={() => onCloseTask(paneGroup.activeTaskId!)}
          />
        ) : (
          <div className="empty-pane">
            <p>No tasks open in this pane.</p>
            <p>Drag tasks here from other panes or add from search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaneGroupComponent;
