import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableTab from './DraggableTab';
import TaskDetail from './TaskDetail';
import { Task, PaneGroup as PaneGroupType } from '../types';

// Define the drag item type
const ITEM_TYPE = 'TAB';

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
  // Set up drop target for empty pane area
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { taskId: string, paneId: string }) => {
      if (item.paneId !== paneGroup.id) {
        onMoveTask(item.taskId, item.paneId, paneGroup.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
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
        ref={drop}
        className={`pane-content ${isOver && paneGroup.taskIds.length === 0 ? 'drop-target' : ''}`}
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
