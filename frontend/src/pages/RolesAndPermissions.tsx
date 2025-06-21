const RolesAndPermissions = () => {
  const roles = [
    {
      name: "Project Manager",
      modules: ["Tasks", "RFIs", "Documents", "Reports"],
      users: 12,
    },
    {
      name: "Site Supervisor",
      modules: ["Daily Logs", "Photos", "Checklists"],
      users: 8,
    },
    {
      name: "Engineer",
      modules: ["RFIs", "Documents", "Approvals"],
      users: 5,
    },
    {
      name: "Subcontractor",
      modules: ["Progress", "Issues", "Limited Docs"],
      users: 15,
    },
  ];
  return (
    <div className="p-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-1">Roles & Permissions</h1>
      <p className="text-gray-500 mb-6">
        Configure user roles and module permissions
      </p>
      <button className="btn btn-primary mb-6">Create Custom Role</button>

      {/* Roles & Permissions Section */}
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.name}
              className="bg-base-200 border border-base-300 rounded-2xl p-6 flex flex-col gap-3 relative"
            >
              <div className="absolute top-4 right-4 bg-warning text-warning-content text-xs rounded-full px-3 py-1 font-semibold">
                {role.users} users
              </div>
              <div className="text-lg font-semibold">{role.name}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {role.modules.map((mod) => (
                  <span key={mod} className="badge badge-neutral text-sm">
                    {mod}
                  </span>
                ))}
              </div>
              <button className="btn btn-primary bg-black btn-sm w-max">
                Edit Permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesAndPermissions;
