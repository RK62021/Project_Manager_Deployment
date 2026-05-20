const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization (must be owner or member)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'User not authorized to access tasks for this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project: projectId, assignedToEmail } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Please add a title and project ID' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization (must be owner or member)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'User not authorized to create tasks in this project' });
    }

    // Resolve assignedTo by email if provided
    let assignedTo = undefined;
    if (assignedToEmail) {
      const user = await User.findOne({ email: assignedToEmail });
      if (user) {
        // Must be a project member or owner to be assigned
        const isUserMember = project.members.some(
          (mId) => mId.toString() === user._id.toString()
        );
        const isUserOwner = project.owner.toString() === user._id.toString();

        if (isUserMember || isUserOwner) {
          assignedTo = user._id;
        } else {
          return res.status(400).json({ message: 'Assigned user is not part of this project' });
        }
      } else {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      project: projectId,
      assignedTo,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToEmail } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Check authorization (must be owner or member of project)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'User not authorized to update tasks in this project' });
    }

    // Resolve assignedToEmail if provided
    let assignedTo = task.assignedTo;
    if (assignedToEmail !== undefined) {
      if (assignedToEmail === '') {
        assignedTo = null; // Unassign task
      } else {
        const user = await User.findOne({ email: assignedToEmail });
        if (user) {
          const isUserMember = project.members.some(
            (mId) => mId.toString() === user._id.toString()
          );
          const isUserOwner = project.owner.toString() === user._id.toString();

          if (isUserMember || isUserOwner) {
            assignedTo = user._id;
          } else {
            return res.status(400).json({ message: 'Assigned user is not part of this project' });
          }
        } else {
          return res.status(404).json({ message: 'Assigned user not found' });
        }
      }
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name email');

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Check authorization (must be owner or member of project)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'User not authorized to delete tasks in this project' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
};
