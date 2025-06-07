import { useProjects, type Project } from "../hooks/useProjects";
import { useAuthStore } from "../stores/useAuthStore";

const Dashboard = () => {
  const { data: projects, isLoading } = useProjects();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <h2>Welcome {user?.name}</h2>
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <ul>
          {projects?.map((proj: Project) => (
            <li key={proj.id}>{proj.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
