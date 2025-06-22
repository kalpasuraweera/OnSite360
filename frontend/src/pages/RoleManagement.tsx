import { useState } from "react";

const RolesAndPermissions = () => {
  const [activeTab, setActiveTab] = useState("current_user_roles");
  const [currentStep, setCurrentStep] = useState(1);
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
      <h1 className="text-3xl font-bold mb-1">User Roles Management</h1>
      <p className="text-gray-500 mb-6">
        Configure user roles and module permissions
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label="Current User Roles"
          checked={activeTab === "current_user_roles"}
          onChange={() => setActiveTab("current_user_roles")}
        />
        {activeTab === "current_user_roles" && (
          <div className="tab-content p-5">
            {/* Tab content 1 */}
            {/* Roles & Permissions Section */}
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="bg-base-200 border border-base-300 rounded-2xl p-2  flex flex-col gap-3 relative"
                  >
                    <div className="flex flex-col gap-1 bg-base-300 rounded-2xl p-3">
                      <div className="absolute top-4 right-4 bg-warning text-warning-content text-xs rounded-full px-3 py-1 font-semibold">
                        {role.users} users
                      </div>
                      <div className="text-lg font-semibold">{role.name}</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {role.modules.map((mod) => (
                          <span
                            key={mod}
                            className="badge badge-neutral text-sm"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="btn bg-black btn-sm w-max">
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create user role */}
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label="Create User Role"
          checked={activeTab === "create_user_role"}
          onChange={() => setActiveTab("create_user_role")}
        />
        {activeTab === "create_user_role" && (
          <div className="tab-content flex gap-2 p-5 w-full">
            <div className="flex gap-2">
              {/* Steps */}
              <div className="flex flex-col w-1/3 gap-2 bg-base-200 rounded-2xl border border-base-300 p-2">
                {/* Step 01 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 1
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <p className="text-xs">Step 01</p>
                  <h1 className="font-semibold">Specify User Details</h1>
                </div>
                {/* Step 02 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 2
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(2)}
                >
                  <p className="text-xs">Step 02</p>
                  <h1 className="font-semibold">Set Permissions</h1>
                </div>
                {/* Step 03 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 3
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(3)}
                >
                  <p className="text-xs">Step 03</p>
                  <h1 className="font-semibold">Review and Create</h1>
                </div>
              </div>

              {/* User roles Details Form */}
              {currentStep === 1 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">User details</h2>
                  <form className="flex flex-col gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          User name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Enter user name"
                        maxLength={64}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">
                        The user name can have up to 64 characters. Valid
                        characters: A-Z, a-z, 0-9, and + = , . @ - (hyphen)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        id="console-access"
                      />
                      <label htmlFor="console-access" className="text-sm">
                        Provide user access to the{" "}
                        <span className="font-medium">
                          AWS Management Console
                        </span>{" "}
                        <span className="italic text-xs">- optional</span>
                        <br />
                        <span className="text-xs text-blue-600">
                          If you're providing console access to a person, it's{" "}
                          <a href="#" className="underline">
                            best practice
                          </a>{" "}
                          to manage their access in IAM Identity Center.
                        </span>
                      </label>
                    </div>
                    <div className="bg-base-100 border border-info rounded-lg p-3 flex items-start gap-2">
                      <span className="text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline w-5 h-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                          />
                        </svg>
                      </span>
                      <span className="text-xs text-gray-700">
                        If you are creating programmatic access through access
                        keys or service-specific credentials for AWS CodeCommit
                        or Amazon Keyspaces, you can generate them after you
                        create this IAM user.{" "}
                        <a href="#" className="text-blue-600 underline">
                          Learn more
                        </a>
                      </span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(2)}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assign Permissions */}
              {currentStep === 2 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">Permissions</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        className="input input-bordered w-1/2"
                        placeholder="Filter permissions by name, type or access level"
                      />
                      <button className="btn btn-primary">
                        Create Permission
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Permission Name</th>
                            <th>Access Level</th>
                            <th>Type</th>
                            <th>Attached Entities</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              name: "Access Analyzer Service",
                              accessLevel: ["Read", "Write", "Read Only"],
                              type: "AWS managed",
                              entities: 0,
                            },
                            {
                              name: "Administrator Access",
                              accessLevel: ["Write", "Read", "Read Only"],
                              type: "AWS managed",
                              entities: 0,
                            },
                            {
                              name: "Administrator Access - Elastic Beanstalk",
                              accessLevel: ["Write", "Read", "Read Only"],
                              type: "AWS managed",
                              entities: 0,
                            },
                            {
                              name: "Alexa for Business Device Setup",
                              accessLevel: ["Read Only", "Read", "Write"],
                              type: "AWS managed",
                              entities: 0,
                            },
                          ].map((permission, index) => (
                            <tr key={index}>
                              <td>
                                <input type="checkbox" className="checkbox" />
                              </td>
                              <td>{permission.name}</td>
                              <td>
                                <select className="select select-bordered w-full max-w-xs">
                                  {permission.accessLevel.map((level, idx) => (
                                    <option key={idx} value={level}>
                                      {level}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>{permission.type}</td>
                              <td>{permission.entities}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-neutral mr-2"
                          onClick={() => setCurrentStep(1)}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => setCurrentStep(3)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review choices */}
              {currentStep === 3 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold">Review your choices</h2>
                  <p className="text-base-content text-xs mb-6">
                    After you create the user, you can view and download the
                    autogenerated password, if enabled.
                  </p>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">User details</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        {/* head */}
                        <thead>
                          <tr>
                            <th>User Role</th>
                            <th>Password Type</th>
                            <th>Require Password Reset</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* row 1 */}
                          <tr>
                            <th>Executive admin</th>
                            <td>Custom Password</td>
                            <td>
                              <span className="badge badge-success">Yes</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Permissions summary
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Access Level</th>
                            <th>Type</th>
                            <th>Used as</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>AdministratorAccess</td>
                            <td>
                              <span className="badge badge-error">Write</span>
                            </td>
                            <td>AWS managed - job function</td>
                            <td>Permissions policy</td>
                          </tr>
                          <tr>
                            <td>IAMUserChangePassword</td>
                            <td>
                              <span className="badge badge-error">Write</span>
                            </td>
                            <td>AWS managed</td>
                            <td>Permissions policy</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="btn btn-neutral"
                      onClick={() => setCurrentStep(2)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary">Create user</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesAndPermissions;
