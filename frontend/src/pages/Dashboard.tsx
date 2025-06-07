import { useProjects, type Project } from "../hooks/useProjects";
import { useAuthStore } from "../stores/useAuthStore";

const Dashboard = () => {
  const { data, isLoading } = useProjects();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <h2>Welcome {user?.firstName}</h2>
      <div className="mb-4">
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <ul>
          {data.data?.map((proj: Project) => (
            <li key={proj.id}>{proj.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
