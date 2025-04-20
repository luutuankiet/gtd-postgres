import { Task } from '../types';

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Implement search functionality',
    content: 'Create a search bar component that filters tasks based on text input',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2023-12-15',
    folder: 'Development',
    list: 'Frontend Tasks',
    tags: ['react', 'typescript', 'ui'],
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-05T14:30:00Z'
  },
  {
    id: '2',
    title: 'Design database schema',
    content: 'Create PostgreSQL schema for tasks, lists, and folders',
    status: 'completed',
    priority: 'high',
    dueDate: '2023-10-30',
    folder: 'Development',
    list: 'Backend Tasks',
    tags: ['database', 'postgresql', 'schema'],
    createdAt: '2023-10-15T09:00:00Z',
    updatedAt: '2023-10-28T16:45:00Z'
  },
  {
    id: '3',
    title: 'Research text search capabilities',
    content: 'Investigate PostgreSQL full-text search features including tsvector and tsquery',
    status: 'completed',
    priority: 'medium',
    dueDate: '2023-10-20',
    folder: 'Research',
    list: 'Database Research',
    tags: ['postgresql', 'search', 'research'],
    createdAt: '2023-10-10T11:20:00Z',
    updatedAt: '2023-10-18T13:15:00Z'
  },
  {
    id: '4',
    title: 'Create project documentation',
    content: 'Document the project architecture, API endpoints, and setup instructions',
    status: 'pending',
    priority: 'medium',
    dueDate: '2023-12-20',
    folder: 'Documentation',
    list: 'Project Docs',
    tags: ['documentation', 'markdown'],
    createdAt: '2023-11-10T15:30:00Z',
    updatedAt: '2023-11-10T15:30:00Z'
  },
  {
    id: '5',
    title: 'Set up CI/CD pipeline',
    content: 'Configure GitHub Actions for automated testing and deployment',
    status: 'pending',
    priority: 'low',
    dueDate: '2023-12-30',
    folder: 'DevOps',
    list: 'Infrastructure',
    tags: ['github', 'ci-cd', 'automation'],
    createdAt: '2023-11-12T09:45:00Z',
    updatedAt: '2023-11-12T09:45:00Z'
  }
];

export const folders = ['Development', 'Research', 'Documentation', 'DevOps'];
export const lists = ['Frontend Tasks', 'Backend Tasks', 'Database Research', 'Project Docs', 'Infrastructure'];
export const tags = ['react', 'typescript', 'ui', 'database', 'postgresql', 'schema', 'search', 'research', 'documentation', 'markdown', 'github', 'ci-cd', 'automation'];
