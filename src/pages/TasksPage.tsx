import React, { useState } from 'react';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskDetailView } from '../components/tasks/TaskDetailView';
import { useLiveData } from '../hooks/useLiveData';
import { Task, TaskProgressStep } from '../types';

export const TasksPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, isLoaded } = useLiveData();

  const handleUpdateStatus = (taskId: string, newStatus: TaskProgressStep) => {
    // Optional status update handler
  };

  if (selectedTask) {
    const updatedTask = tasks.find((t) => t.id === selectedTask.id) || selectedTask;
    return (
      <TaskDetailView
        task={updatedTask}
        onBack={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Task Oversight & Monitoring</h1>
          <p className="page-subheading">Track live service requests, status step progress, and uploaded proof</p>
        </div>
      </div>

      <TaskTable
        tasks={tasks}
        isLoading={!isLoaded}
        onUpdateStatus={handleUpdateStatus}
        onSelectTask={setSelectedTask}
      />
    </div>
  );
};
