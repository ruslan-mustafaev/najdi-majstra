import { supabase } from './supabase';

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  order_index: number;
}

export interface Project {
  id: string;
  name: string;
  phases: {
    priprava: { notes: ProjectTask[] };
    realizacia: { notes: ProjectTask[] };
    ukoncenie: { notes: ProjectTask[] };
  };
}

// Load all projects for the current master
export async function loadProjects(masterId: string): Promise<Record<string, Project>> {
  try {
    // Load projects
    const { data: projects, error: projectsError } = await supabase
      .from('master_projects')
      .select('*')
      .eq('master_id', masterId)
      .order('created_at', { ascending: true });

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      return {};
    }

    // Load all tasks for these projects
    const projectIds = projects.map(p => p.id);
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .in('project_id', projectIds)
      .order('order_index', { ascending: true });

    if (tasksError) throw tasksError;

    // Organize data into the format expected by the component
    const projectsMap: Record<string, Project> = {};

    projects.forEach(project => {
      const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];

      projectsMap[project.id] = {
        id: project.id,
        name: project.name,
        phases: {
          priprava: {
            notes: projectTasks
              .filter(t => t.phase === 'priprava')
              .map(t => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                order_index: t.order_index
              }))
          },
          realizacia: {
            notes: projectTasks
              .filter(t => t.phase === 'realizacia')
              .map(t => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                order_index: t.order_index
              }))
          },
          ukoncenie: {
            notes: projectTasks
              .filter(t => t.phase === 'ukoncenie')
              .map(t => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                order_index: t.order_index
              }))
          }
        }
      };
    });

    return projectsMap;
  } catch (error) {
    console.error('Error loading projects:', error);
    return {};
  }
}

// Create a new project
export async function createProject(masterId: string, name: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('master_projects')
      .insert([{ master_id: masterId, name }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

// Delete a project (CASCADE will delete all tasks)
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('master_projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Add a task to a project
export async function addTask(
  projectId: string,
  phase: 'priprava' | 'realizacia' | 'ukoncenie',
  text: string,
  orderIndex: number
): Promise<ProjectTask | null> {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert([{
        project_id: projectId,
        phase,
        text,
        order_index: orderIndex,
        completed: false
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      text: data.text,
      completed: data.completed,
      order_index: data.order_index
    };
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

// Toggle task completion
export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling task:', error);
    return false;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Rename a project
export async function renameProject(projectId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('master_projects')
      .update({ name: newName })
      .eq('id', projectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error renaming project:', error);
    return false;
  }
}
