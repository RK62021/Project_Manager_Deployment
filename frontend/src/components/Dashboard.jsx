import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import ProjectModal from './ProjectModal';
import { LayoutGrid, FolderPlus, LogOut, User, Users, ChevronRight, BarChart2, Plus, Clock } from 'lucide-react';

const Dashboard = ({ user, onLogout, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0 });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
      
      // Calculate aggregate stats across all loaded projects
      let totalTasks = 0;
      let completedTasks = 0;
      
      for (const proj of res.data) {
        try {
          const taskRes = await api.get(`/tasks/project/${proj._id}`);
          totalTasks += taskRes.data.length;
          completedTasks += taskRes.data.filter(t => t.status === 'Done').length;
        } catch (err) {
          console.error(`Failed to fetch tasks for project ${proj._id}`, err);
        }
      }
      
      setTaskStats({
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks
      });
    } catch (error) {
      console.error('Error fetching dashboard projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data) => {
    try {
      const res = await api.post('/projects', data);
      setProjects([res.data, ...projects]);
      // Refetch stats
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <div className="main-content animate-fade-in">
      {/* Top Navbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: '8px',
            padding: '0.4rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <LayoutGrid size={20} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            TeamFlow <span style={{ color: 'var(--accent)', fontWeight: 400 }}>Dashboard</span>
          </h2>
        </div>

        {/* User profile controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <User size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Primary Dashboard Body */}
      <div className="container-padding" style={{ padding: '2rem 1.5rem' }}>
        
        {/* Welcome Block */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            System Status: <span className="gradient-text">Active</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Welcome back, {user?.name}. Here is an overview of active project operations and task status monitors.
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)' }}>
              <LayoutGrid size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workspaces</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{projects.length}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent)' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{taskStats.total}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{taskStats.completed}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Actions</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{taskStats.pending}</div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Active Workspaces
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <FolderPlus size={16} />
            <span>Create Project</span>
          </button>
        </div>

        {/* Projects Cards Container */}
        {projects.length === 0 ? (
          <div className="glass-panel animate-fade-in" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderStyle: 'dashed',
            borderColor: 'var(--glass-border-hover)'
          }}>
            <LayoutGrid size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Workspaces Configured</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Create your first project workspace to begin logging objectives and coordinating team activities.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} />
              <span>Initialize Workspace</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {projects.map((proj) => {
              const isOwner = proj.owner?._id === user?._id;
              return (
                <div
                  key={proj._id}
                  className="glass-panel glass-panel-interactive animate-fade-in"
                  onClick={() => onSelectProject(proj)}
                  style={{
                    padding: '1.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isOwner ? 'rgba(79, 70, 229, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: isOwner ? 'var(--primary)' : 'var(--accent)',
                        border: `1px solid ${isOwner ? 'rgba(79, 70, 229, 0.25)' : 'rgba(6, 182, 212, 0.25)'}`
                      }}>
                        {isOwner ? 'Owner' : 'Collaborator'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <Users size={14} />
                        <span>{1 + (proj.members?.length || 0)}</span>
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {proj.name}
                    </h3>
                    
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '1.5rem',
                      lineHeight: 1.4
                    }}>
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontWeight: 500, fontSize: '0.85rem' }}>
                      <span>Open Workspace</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
