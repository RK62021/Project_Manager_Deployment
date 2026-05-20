import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import { ChevronLeft, Plus, Settings, Trash2, Calendar, UserPlus, Users, Edit3, ArrowRight, HelpCircle } from 'lucide-react';

const ProjectBoard = ({ user, project, onBack, onDeleteProject, onUpdateProject }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(project);
  
  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('Todo');

  // Invitation state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/project/${activeProject._id}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeProject._id]);

  // Project Actions
  const handleEditProject = async (data) => {
    try {
      const res = await api.put(`/projects/${activeProject._id}`, data);
      setActiveProject(res.data);
      onUpdateProject(res.data);
    } catch (err) {
      console.error('Failed to edit project:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete this workspace and all associated tasks permanently? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${activeProject._id}`);
        onDeleteProject(activeProject._id);
        onBack();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  // Task Actions
  const handleCreateOrUpdateTask = async (data) => {
    try {
      if (selectedTask) {
        // Edit Mode
        const res = await api.put(`/tasks/${selectedTask._id}`, data);
        setTasks(tasks.map(t => t._id === selectedTask._id ? res.data : t));
      } else {
        // Create Mode
        const res = await api.post('/tasks', { ...data, project: activeProject._id });
        setTasks([res.data, ...tasks]);
      }
      fetchTasks(); // Reload to populate associations
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task permanently?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Invite Action
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError('');
    setInviteSuccess('');
    setIsInviting(true);
    try {
      const res = await api.post(`/projects/${activeProject._id}/members`, { email: inviteEmail });
      setActiveProject(res.data);
      onUpdateProject(res.data);
      setInviteSuccess('Collaborator added successfully!');
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to add collaborator.');
    } finally {
      setIsInviting(false);
    }
  };

  // Open modal helpers
  const openCreateTaskModal = (status) => {
    setSelectedTask(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const columns = [
    { title: 'Todo', status: 'Todo', color: '#6b7280' },
    { title: 'In Progress', status: 'In Progress', color: 'var(--primary)' },
    { title: 'In Review', status: 'In Review', color: 'var(--accent)' },
    { title: 'Done', status: 'Done', color: 'var(--success)' },
  ];

  if (loading && tasks.length === 0) {
    return <Spinner fullPage />;
  }

  const isOwner = activeProject.owner?._id === user?._id;

  return (
    <div className="main-content animate-fade-in">
      {/* Board Top Header */}
      <div style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Navigation back and Project info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeProject.name}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Managed by {isOwner ? 'You' : activeProject.owner?.name}
            </span>
          </div>
        </div>

        {/* Administration Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {isOwner && (
            <>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn btn-danger"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Board Area */}
      <div className="container-padding" style={{ padding: '1.5rem' }}>
        
        {/* Collapsible details Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Project Details Description Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Project Charter
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {activeProject.description || 'No descriptive statement provided. Edit workspace details to declare parameters.'}
            </p>
          </div>

          {/* Collaborators Invitation Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} />
              <span>Project Collaborators ({1 + (activeProject.members?.length || 0)})</span>
            </h4>
            
            {/* Team list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                👑 {activeProject.owner?.name} (Owner)
              </div>
              {activeProject.members?.map((m) => (
                <div key={m._id} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  👤 {m.name}
                </div>
              ))}
            </div>

            {/* Invite input form (Only accessible by owner) */}
            {isOwner && (
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="collaborator@domain.com"
                  className="form-input"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess(''); }}
                  style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  disabled={isInviting}
                >
                  <UserPlus size={16} />
                </button>
              </form>
            )}
            
            {/* Invite alerts */}
            {inviteError && <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.4rem' }}>{inviteError}</div>}
            {inviteSuccess && <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.4rem' }}>{inviteSuccess}</div>}
          </div>
        </div>

        {/* Board Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="glass-panel"
                style={{
                  background: 'rgba(17, 24, 39, 0.4)',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '12px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: col.color,
                      boxShadow: `0 0 8px 0 ${col.color}`
                    }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{col.title}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '8px'
                    }}>
                      {colTasks.length}
                    </span>
                  </div>
                  
                  {/* Create Task Shortcut */}
                  <button
                    onClick={() => openCreateTaskModal(col.status)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: 'var(--text-primary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Column Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
                  {colTasks.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2.5rem 1rem',
                      color: 'var(--text-muted)',
                      border: '1px dashed rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <span>No actions</span>
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const priorityClass = `badge badge-${t.priority?.toLowerCase()}`;
                      return (
                        <div
                          key={t._id}
                          className="glass-panel animate-fade-in"
                          style={{
                            background: 'rgba(31, 41, 55, 0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '10px',
                            cursor: 'default',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          {/* Task Top Meta Info */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className={priorityClass}>{t.priority}</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                onClick={() => openEditTaskModal(t)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t._id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Task Content */}
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.3 }}>
                            {t.title}
                          </h4>
                          <p style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginBottom: '0.75rem',
                            lineHeight: 1.3
                          }}>
                            {t.description || 'No description added.'}
                          </p>

                          {/* Task Bottom Status Controls & Assignee */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.6rem',
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {t.dueDate ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: new Date(t.dueDate) < new Date() && t.status !== 'Done' ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  <Calendar size={12} />
                                  <span>{new Date(t.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                </span>
                              ) : (
                                <span>No due date</span>
                              )}
                            </div>
                            
                            <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                              {t.assignedTo ? `👤 ${t.assignedTo.name}` : 'Unassigned'}
                            </div>
                          </div>

                          {/* Quick Shift Status Bar */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.4rem',
                            marginTop: '0.6rem',
                            paddingTop: '0.4rem',
                            borderTop: '1px dashed rgba(255,255,255,0.03)'
                          }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shift column:</span>
                            <select
                              value={t.status}
                              onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">Progress</option>
                              <option value="In Review">Review</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Settings Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleEditProject}
        project={activeProject}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        task={selectedTask}
        defaultStatus={defaultTaskStatus}
      />
    </div>
  );
};

export default ProjectBoard;
