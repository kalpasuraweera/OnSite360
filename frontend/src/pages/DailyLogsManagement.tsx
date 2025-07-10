import React, { useState } from "react";

const dummyLogs = [
	{
		id: "2024-01-14",
		date: "2024-01-14",
		weather: "Cloudy, 42°F",
		crewCount: 24,
		work: "Light rain, minor electrical work on Floor 2.",
		issues: "None",
		status: "Submitted",
	},
	{
		id: "2024-01-13",
		date: "2024-01-13",
		weather: "Light rain, 38°F",
		crewCount: 20,
		work: "Material delivery and site prep.",
		issues: "Short delay due to rain.",
		status: "Submitted",
	},
	{
		id: "2024-01-12",
		date: "2024-01-12",
		weather: "Clear, 48°F",
		crewCount: 22,
		work: "Foundation work completed.",
		issues: "None",
		status: "Submitted",
	},
];

const dummyTasks = [
	{
		id: "t1",
		title: "Foundation Pour - Building A",
		team: "Team Alpha",
		progress: 85,
		status: "In Progress",
		priority: "High",
	},
	{
		id: "t2",
		title: "Electrical Rough-in - Floor 2",
		team: "ElectriCorp",
		progress: 60,
		status: "In Progress",
		priority: "Medium",
	},
	{
		id: "t3",
		title: "Material Delivery Coordination",
		team: "Team Beta",
		progress: 0,
		status: "Pending",
		priority: "High",
	},
	{
		id: "t4",
		title: "Site Cleanup - Area C",
		team: "Team Gamma",
		progress: 100,
		status: "Completed",
		priority: "Low",
	},
];

const dummyCrews = [
	{
		id: "c1",
		name: "Team Alpha",
		members: ["John Smith", "Mike Wilson", "Dave Brown"],
		task: "Foundation Work",
		active: true,
	},
	{
		id: "c2",
		name: "Team Beta",
		members: ["Sarah Connor", "Lisa Anderson", "Mary Johnson"],
		task: "Material Handling",
		active: true,
	},
	{
		id: "c3",
		name: "ElectriCorp",
		members: ["Bob Electric", "Jim Sparks", "Ray Current"],
		task: "Electrical Work",
		active: true,
	},
];

const attendance = {
	present: 22,
	total: 24,
	hours: 176,
	absent: [
		{ name: "Mike Wilson", reason: "Sick Leave" },
		{ name: "Dave Brown", reason: "Personal" },
	],
};

const today = {
	date: "2024-01-15",
	day: "Monday",
	crewCount: 0,
};

export default function DailyLogsManagement() {
	const [activeTab, setActiveTab] = useState("daily_log");
	const [work, setWork] = useState("");
	const [issues, setIssues] = useState("");
	const [photos, setPhotos] = useState<(string | null)[]>([null, null]);
	const [recentLogs] = useState(dummyLogs);
	const [weather, setWeather] = useState(""); // Start as empty string
	const [crewCount, setCrewCount] = useState(today.crewCount);

	// New: Track which log's details are open
	const [openLogId, setOpenLogId] = useState<string | null>(null);
	const [editLogId, setEditLogId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState({
		weather: "",
		crewCount: 0,
		work: "",
		issues: "",
	});

	// New state for adding photos to tasks
	const [addPhotoTaskId, setAddPhotoTaskId] = useState<string | null>(null);
	const [taskPhoto, setTaskPhoto] = useState<string | null>(null);

	// Add these states at the top of your component:
	const [reportIssueTaskId, setReportIssueTaskId] = useState<string | null>(null);
	const [taskIssueForm, setTaskIssueForm] = useState({
		type: "Safety Hazard",
		location: "",
		description: "",
		priority: "High - Immediate attention",
		photos: null as File | null,
	});

	// New state for crew management
	const [openCrewId, setOpenCrewId] = useState<string | null>(null);
	const [reassignCrewId, setReassignCrewId] = useState<string | null>(null);
	const [selectedUser, setSelectedUser] = useState("");
	const [accessLevel, setAccessLevel] = useState("Level 1 (Read Only)");

	// Example user list for the dropdown (replace with your real users)
	const users = [
		"Choose a user",
		"John Smith",
		"Mike Wilson",
		"Dave Brown",
		"Sarah Connor",
		"Lisa Anderson",
		"Mary Johnson",
		"Bob Electric",
		"Jim Sparks",
		"Ray Current",
	];

	// Handle photo upload (mock)

	const handleEditClick = (log: typeof dummyLogs[0]) => {
		setEditForm({
			weather: log.weather,
			crewCount: log.crewCount,
			work: log.work,
			issues: log.issues,
		});
		setEditLogId(log.id);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({
			...prev,
			[name]: name === "crewCount" ? Number(value) : value,
		}));
	};

	const handleEditSave = () => {
		// Here you would update the log in your backend or state
		// For demo, just close the popup
		setEditLogId(null);
	};

	const handleEditCancel = () => {
		setEditLogId(null);
	};

	// Handler for form changes
	const handleTaskIssueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setTaskIssueForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handler for photo upload
	const handleTaskIssuePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setTaskIssueForm((prev) => ({
			...prev,
			photos: file,
		}));
	};

	// Handler for submit (demo: just close popup)
	const handleTaskIssueSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setReportIssueTaskId(null);
		// You can add logic to save the issue here
	};

	// Add this state at the top of your component:
	const [checkedInCrews, setCheckedInCrews] = useState<string[]>([]);
	const [showAttendancePopup, setShowAttendancePopup] = useState(false);
	const [showTimesheetPopup, setShowTimesheetPopup] = useState(false);
	const [showBriefingPopup, setShowBriefingPopup] = useState(false);

	// New state for safety checklist details
	const [openSafetyChecklistId, setOpenSafetyChecklistId] = useState<string | null>(null);

	// Add this state at the top of your component, with the other useState hooks:
	const [openIssueId, setOpenIssueId] = useState<string | null>(null);


	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-1">Daily Logs Management</h1>
			<p className="text-gray-500 mb-6">
				Downtown Office Complex
			</p>

			{/* Tabs */}
			<div className="tabs tabs-border mb-4">
				<button
					className={`tab text-base ${activeTab === "daily_log" ? "tab-active font-bold" : ""}`}
					onClick={() => setActiveTab("daily_log")}
				>
					Daily Log
				</button>
				<button
					className={`tab text-base ${activeTab === "tasks" ? "tab-active font-bold" : ""}`}
					onClick={() => setActiveTab("tasks")}
				>
					Tasks
				</button>
				<button
					className={`tab text-base ${activeTab === "crew" ? "tab-active font-bold" : ""}`}
					onClick={() => setActiveTab("crew")}
				>
					Crew Management
				</button>
				<button
					className={`tab text-base ${activeTab === "safety" ? "tab-active font-bold" : ""}`}
					onClick={() => setActiveTab("safety")}
				>
					Safety & QA
				</button>
				<button
					className={`tab text-base ${activeTab === "issues" ? "tab-active font-bold" : ""}`}
					onClick={() => setActiveTab("issues")}
				>
					Issues
				</button>
			</div>

			{activeTab === "daily_log" && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Today's Log Entry */}
					<div className="col-span-2 bg-base-100 rounded-2xl p-6 shadow">
						<h2 className="text-xl font-bold mb-1">Today's Log Entry</h2>
						<div className="text-gray-400 mb-4">
							{today.date} – {today.day}
						</div>
						<form className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="label">
										<span className="label-text font-medium">Weather</span>
									</label>
									<input
										className="input input-bordered w-full"
										value={weather}
										onChange={(e) => setWeather(e.target.value)}
									/>
								</div>
								<div>
									<label className="label">
										<span className="label-text font-medium">Crew Count</span>
									</label>
									<div className="flex items-center gap-2">
										<input
											className="input input-bordered w-50 text-center"
											type="number"
											min={0}
											value={crewCount}
											onChange={(e) => setCrewCount(Number(e.target.value))}
										/>
									</div>
								</div>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Work Completed Today</span>
								</label>
								<textarea
									className="textarea textarea-bordered w-full"
									rows={2}
									value={work}
									onChange={(e) => setWork(e.target.value)}
									placeholder="Describe work completed today..."
								/>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Issues/Delays</span>
								</label>
								<textarea
									className="textarea textarea-bordered w-full"
									rows={2}
									value={issues}
									onChange={(e) => setIssues(e.target.value)}
									placeholder="Describe any issues or delays..."
								/>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Site Photos</span>
								</label>
								<div
									className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center py-8 cursor-pointer hover:border-primary transition"
									style={{ minHeight: 140 }}
									onClick={() => document.getElementById("site-photo-input")?.click()}
									onDragOver={e => e.preventDefault()}
									onDrop={e => {
										e.preventDefault();
										const file = e.dataTransfer.files?.[0];
										if (file) {
											const url = URL.createObjectURL(file);
											setPhotos([url, ...photos.slice(1)]);
										}
									}}
								>
									{photos[0] ? (
										<img
											src={photos[0]}
											alt="Site"
											className="object-contain h-24 mb-2"
										/>
									) : (
										<>
											<span className="text-4xl text-gray-400 mb-2">
												<svg xmlns="http://www.w3.org/2000/svg" className="inline" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /></svg>
											</span>
											<span className="text-gray-500 text-base">
												Drag &amp; drop photo here, or click to select
											</span>
										</>
									)}
									<input
										id="site-photo-input"
										type="file"
										accept="image/*"
										className="hidden"
										onChange={e => {
											const file = e.target.files?.[0];
											if (file) {
												const url = URL.createObjectURL(file);
												setPhotos([url, ...photos.slice(1)]);
											}
										}}
									/>
								</div>
							</div>
							<button type="submit" className="btn btn-primary w-full mt-4">
								Submit Daily Log
							</button>
						</form>
					</div>

					{/* Recent Log Entries */}
					<div className="bg-base-100 rounded-2xl p-6 shadow">
						<h2 className="text-lg font-bold mb-2">Recent Log Entries</h2>
						<div className="text-gray-400 mb-2">Previous daily reports</div>
						<div className="space-y-4">
							{recentLogs.map((log) => (
								<div key={log.id} className="p-4 bg-base-200 rounded-lg shadow mb-2">
									<div className="flex justify-between text-sm text-gray-500 mb-2">
										<div>{log.date}</div>
										<div>{log.weather}</div>
										<div>Crew: {log.crewCount}</div>
									</div>
									<div className="text-gray-700 mb-2">
										<strong>Work:</strong> {log.work}
									</div>
									<div className="text-gray-700 mb-2">
										<strong>Issues:</strong> {log.issues}
									</div>
									<div className="flex justify-end gap-2">
										<button
											className="btn btn-sm btn-primary"
											onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}
										>
											{openLogId === log.id ? "Close" : "View"}
										</button>
										<button
											className="btn btn-sm btn-outline"
											onClick={() => handleEditClick(log)}
										>
											Edit
										</button>
										<button className="btn btn-sm btn-danger">
											Delete
										</button>
									</div>
									{openLogId === log.id && (
										<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
											<h4 className="font-bold mb-2">Log Details</h4>
											<div><strong>Date:</strong> {log.date}</div>
											<div><strong>Weather:</strong> {log.weather}</div>
											<div><strong>Crew Count:</strong> {log.crewCount}</div>
											<div><strong>Work Completed:</strong> {log.work}</div>
											<div><strong>Issues/Delays:</strong> {log.issues}</div>
											<div><strong>Status:</strong> {log.status}</div>
										</div>
									)}
									{/* Edit Popup */}
									{editLogId === log.id && (
										<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
											<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
												<button
													className="absolute top-2 right-2 text-xl"
													onClick={handleEditCancel}
													aria-label="Close"
												>
													&times;
												</button>
												<h3 className="text-xl font-bold mb-4">Edit Log Entry</h3>
												<form
													onSubmit={e => {
														e.preventDefault();
														handleEditSave();
													}}
													className="space-y-4"
												>
													<div>
														<label className="label">
															<span className="label-text font-medium">Weather</span>
														</label>
														<input
															className="input input-bordered w-full"
															name="weather"
															value={editForm.weather}
															onChange={handleEditChange}
														/>
													</div>
													<div>
														<label className="label">
															<span className="label-text font-medium">Crew Count</span>
														</label>
														<input
															className="input input-bordered w-full"
															type="number"
															min={0}
															name="crewCount"
															value={editForm.crewCount}
															onChange={handleEditChange}
														/>
													</div>
													<div>
														<label className="label">
															<span className="label-text font-medium">Work Completed</span>
														</label>
														<textarea
															className="textarea textarea-bordered w-full"
															name="work"
															value={editForm.work}
															onChange={handleEditChange}
														/>
													</div>
													<div>
														<label className="label">
															<span className="label-text font-medium">Issues/Delays</span>
														</label>
														<textarea
															className="textarea textarea-bordered w-full"
															name="issues"
															value={editForm.issues}
															onChange={handleEditChange}
														/>
													</div>
													<div className="flex justify-end gap-2 mt-4">
														<button
															type="button"
															className="btn btn-outline"
															onClick={handleEditCancel}
														>
															Cancel
														</button>
														<button type="submit" className="btn btn-primary">
															Save Changes
														</button>
													</div>
												</form>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{activeTab === "tasks" && (
				<div className="bg-base-100 rounded-2xl p-6 shadow">
					<h2 className="text-2xl font-bold mb-1">Assigned Tasks</h2>
					<p className="text-gray-500 mb-6">
						Current work assignments for your crews
					</p>
					<div className="space-y-6">
						{dummyTasks.map((task) => (
							<div
								key={task.id}
								className="bg-base-200 rounded-xl p-6 shadow flex flex-col gap-2 border border-base-300"
							>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
									<div>
										<div className="font-semibold text-lg">{task.title}</div>
										<div className="text-sm text-gray-500">{task.team}</div>
									</div>
									<div className="flex gap-2">
										<span
											className={`badge badge-md ${
												task.status === "Completed"
													? "bg-gray-200 text-gray-700"
													: "bg-black text-white"
											}`}
										>
											{task.status}
										</span>
										<span
											className={`badge badge-md ${
												task.priority === "High"
													? "bg-red-400 text-white"
													: task.priority === "Medium"
													? "bg-gray-700 text-white"
													: "bg-gray-200 text-gray-700"
											}`}
										>
											{task.priority}
										</span>
									</div>
								</div>
								<div className="mt-2 text-sm font-medium">Progress</div>
								<div className="w-full flex items-center gap-2">
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className="bg-blue-600 h-2 rounded-full transition-all"
											style={{ width: `${task.progress}%` }}
										></div>
									</div>
									<span className="ml-2 text-sm font-semibold text-gray-700">
										{task.progress}%
									</span>
								</div>
								<div className="flex flex-wrap gap-2 mt-3">
									<button className="btn btn-outline btn-sm">Update Progress</button>
									<button
										className="btn btn-outline btn-sm"
										onClick={() => setAddPhotoTaskId(addPhotoTaskId === task.id ? null : task.id)}
									>
										Add Photos
									</button>
									<button
										className="btn btn-outline btn-sm"
										onClick={() => setReportIssueTaskId(task.id)}
									>
										Report Issue
									</button>
								</div>
								{/* Add Photo Drop Area */}
								{addPhotoTaskId === task.id && (
									<div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg mt-4 p-6">
										<div className="mb-2 font-medium text-gray-700">Featured Photo</div>
										<div
											className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-100 py-8 cursor-pointer hover:border-primary transition"
											style={{ minHeight: 140 }}
											onClick={() => document.getElementById(`task-photo-input-${task.id}`)?.click()}
											onDragOver={e => e.preventDefault()}
											onDrop={e => {
												e.preventDefault();
												const file = e.dataTransfer.files?.[0];
												if (file) {
													const url = URL.createObjectURL(file);
													setTaskPhoto(url);
												}
											}}
										>
											{taskPhoto ? (
												<img
													src={taskPhoto}
													alt="Task Featured"
													className="object-contain h-24 mb-2"
												/>
											) : (
												<>
													<span className="text-4xl text-gray-400 mb-2">
														<svg xmlns="http://www.w3.org/2000/svg" className="inline" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /></svg>
													</span>
													<span className="text-gray-500 text-base">
														Drag &amp; drop photo here, or click to select
													</span>
												</>
											)}
											<input
												id={`task-photo-input-${task.id}`}
												type="file"
												accept="image/*"
												className="hidden"
												onChange={e => {
													const file = e.target.files?.[0];
													if (file) {
														const url = URL.createObjectURL(file);
														setTaskPhoto(url);
													}
												}}
											/>
										</div>
									</div>
								)}
								{/* Report Issue Popup */}
								{reportIssueTaskId === task.id && (
									<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
										<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
											<button
												className="absolute top-2 right-2 text-xl"
												onClick={() => setReportIssueTaskId(null)}
												aria-label="Close"
											>
												&times;
											</button>
											<h3 className="text-2xl font-bold mb-4">Report New Issue</h3>
											<form className="space-y-4" onSubmit={handleTaskIssueSubmit}>
												{/* New Task field, auto-filled and read-only */}
												<div>
													<label className="label">
														<span className="label-text font-medium">Task</span>
													</label>
													<input
														className="input input-bordered w-full"
														name="task"
														value={task.title}
														readOnly
													/>
												</div>
												<div>
													<label className="label">
														<span className="label-text font-medium">Issue Type</span>
													</label>
													<select
														className="select select-bordered w-full"
														name="type"
														value={taskIssueForm.type}
														onChange={handleTaskIssueChange}
													>
														<option>Safety Hazard</option>
														<option>Equipment Failure</option>
														<option>Material Shortage</option>
														<option>Other</option>
													</select>
												</div>
												<div>
													<label className="label">
														<span className="label-text font-medium">Location</span>
													</label>
													<input
														className="input input-bordered w-full"
														name="location"
														value={taskIssueForm.location}
														onChange={handleTaskIssueChange}
														placeholder="Building A, Floor 2..."
													/>
												</div>
												<div>
													<label className="label">
														<span className="label-text font-medium">Description</span>
													</label>
													<textarea
														className="textarea textarea-bordered w-full"
														name="description"
														rows={3}
														value={taskIssueForm.description}
														onChange={handleTaskIssueChange}
														placeholder="Describe the issue in detail..."
													/>
												</div>
												<div>
													<label className="label">
														<span className="label-text font-medium">Priority</span>
													</label>
													<select
														className="select select-bordered w-full"
														name="priority"
														value={taskIssueForm.priority}
														onChange={handleTaskIssueChange}
													>
														<option>High - Immediate attention</option>
														<option>Medium</option>
														<option>Low</option>
													</select>
												</div>
												<div>
													<label className="label">
														<span className="label-text font-medium">Photos</span>
													</label>
													<div className="flex items-center gap-2">
														<input
															type="file"
															className="file-input file-input-bordered w-full"
															onChange={handleTaskIssuePhoto}
														/>
														<span className="text-gray-400">Add Photos</span>
													</div>
												</div>
												<button type="submit" className="btn bg-black text-white w-full font-bold mt-2">
													Submit Issue Report
												</button>
											</form>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{activeTab === "crew" && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Crew Assignments */}
					<div className="col-span-2 bg-base-100 rounded-2xl p-6 shadow">
						<h2 className="text-2xl font-bold mb-1">Crew Assignments</h2>
						<p className="text-gray-500 mb-6">
							Manage team assignments and tasks
						</p>
						<div className="space-y-6">
							{dummyCrews.map((crew) => (
								<div
									key={crew.id}
									className="bg-base-200 rounded-xl p-6 border border-base-300 flex flex-col gap-2 relative"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
										<div>
											<div className="font-semibold text-lg">{crew.name}</div>
											<div className="text-sm text-gray-500">
												{crew.members.length} members • {crew.task}
											</div>
											<div className="text-xs text-gray-500">
												{crew.members.join(", ")}
											</div>
										</div>
										<span className="badge bg-black text-white absolute top-4 right-4">
											Active
										</span>
									</div>
									<div className="flex flex-wrap gap-2 mt-3">
										<button
											className="btn btn-outline btn-sm"
											onClick={() => setOpenCrewId(openCrewId === crew.id ? null : crew.id)}
										>
											{openCrewId === crew.id ? "Close" : "View Team"}
										</button>
										<button
											className="btn btn-outline btn-sm"
											onClick={() => setReassignCrewId(crew.id)}
										>
											Reassign
										</button>
										<button
											className={`btn btn-sm ${checkedInCrews.includes(crew.id) ? "btn-success" : "btn-outline"}`}
											onClick={() => {
												setCheckedInCrews((prev) =>
													prev.includes(crew.id)
														? prev.filter((id) => id !== crew.id)
														: [...prev, crew.id]
												);
											}}
										>
											{checkedInCrews.includes(crew.id) ? "Checked In" : "Check-in"}
										</button>
									</div>
									{/* Team Members Popup */}
									{openCrewId === crew.id && (
										<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
											<h4 className="font-bold mb-2">Team Members</h4>
											<ul className="list-disc pl-5">
												{crew.members.map((member, idx) => (
													<li key={idx} className="mb-1">{member}</li>
												))}
											</ul>
										</div>
									)}
									{/* Reassign Popup */}
									{reassignCrewId === crew.id && (
										<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
											<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
												<h2 className="text-2xl font-bold mb-4">Add User to Project</h2>
												<form className="space-y-6">
													<div>
														<label className="block font-semibold mb-1">Select User</label>
														<select
															className="input input-bordered w-full"
															value={selectedUser}
															onChange={e => setSelectedUser(e.target.value)}
														>
															{users.map((user, idx) => (
																<option key={idx} value={user}>{user}</option>
															))}
														</select>
													</div>
													<div>
														<label className="block font-semibold mb-1">Access Level</label>
														<select
															className="input input-bordered w-full"
															value={accessLevel}
															onChange={e => setAccessLevel(e.target.value)}
														>
															<option>Level 1 (Read Only)</option>
															<option>Level 2 (Edit)</option>
															<option>Level 3 (Admin)</option>
														</select>
													</div>
													<div className="flex justify-end gap-2 mt-4">
														<button
															type="button"
															className="btn btn-outline"
															onClick={() => setReassignCrewId(null)}
														>
															Cancel
														</button>
														<button
															type="button"
															className="btn btn-disabled"
															disabled
														>
															Add User
														</button>
													</div>
												</form>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
					{/* Attendance Tracking */}
					<div className="bg-base-100 rounded-2xl p-6 shadow flex flex-col gap-4">
						<h2 className="text-2xl font-bold mb-1">Attendance Tracking</h2>
						<p className="text-gray-500 mb-4">
							Today's attendance and hours
						</p>
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
								<span className="text-2xl font-bold text-green-600">
									{attendance.present}/{attendance.total}
								</span>
								<span className="text-gray-500 text-sm">Present Today</span>
							</div>
							<div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
								<span className="text-2xl font-bold text-blue-600">
									{attendance.hours}
								</span>
								<span className="text-gray-500 text-sm">Hours Logged</span>
							</div>
						</div>
						<div className="mb-2 font-semibold">Absent Today</div>
						<div className="space-y-2 mb-4">
							{attendance.absent.map((a) => (
								<div
									key={a.name}
									className="flex justify-between items-center bg-red-50 rounded px-3 py-1"
								>
									<span>{a.name}</span>
									<span className="badge bg-red-400 text-white">{a.reason}</span>
								</div>
							))}
						</div>
						<button
							className="btn btn-outline w-full mb-2"
							onClick={() => setShowAttendancePopup(true)}
						>
							Mark Attendance
						</button>
						<button
							className="btn btn-outline w-full mb-2"
							onClick={() => setShowTimesheetPopup(true)}
						>
							View Timesheets
						</button>
						<button className="btn bg-black text-white w-full font-bold" onClick={() => setShowBriefingPopup(true)}>
							Start Daily Briefing
						</button>
					</div>
				</div>
			)}

			{activeTab === "safety" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Safety Checklists */}
					<div className="bg-base-100 rounded-2xl p-6 shadow flex flex-col gap-4">
						<h2 className="text-2xl font-bold mb-1">Safety Checklists</h2>
						<p className="text-gray-500 mb-4">
							Daily safety inspections and compliance
						</p>
						<div className="space-y-4">
							{/* Checklist Items */}
							<div className="bg-base-200 rounded-xl p-5 flex flex-col gap-2 relative">
								<div className="font-semibold">Morning Safety Briefing</div>
								<div className="text-sm text-gray-500">07:30 AM • 12/12 items</div>
								<button
									className="btn btn-outline btn-sm w-fit"
									onClick={() =>
										setOpenSafetyChecklistId(openSafetyChecklistId === "briefing" ? null : "briefing")
									}
								>
									{openSafetyChecklistId === "briefing" ? "Close" : "View"}
								</button>
								<span className="badge bg-black text-white absolute top-4 right-4">Completed</span>
								{openSafetyChecklistId === "briefing" && (
									<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
										<h4 className="font-bold mb-2">Morning Safety Briefing Details</h4>
										<ul className="list-disc pl-5 text-gray-700">
											<li>PPE checked for all crew</li>
											<li>Fire exits reviewed</li>
											<li>First aid kit location confirmed</li>
											<li>All 12 items completed</li>
										</ul>
									</div>
								)}
							</div>
							<div className="bg-base-200 rounded-xl p-5 flex flex-col gap-2 relative">
								<div className="font-semibold">PPE Compliance Check</div>
								<div className="text-sm text-gray-500">09:15 AM • 8/10 items</div>
								<div className="flex gap-2">
									<button className="btn btn-outline btn-sm w-fit">View</button>
									<button className="btn btn-sm w-fit bg-primary ">Continue</button>
								</div>
								<span className="badge bg-gray-200 text-gray-700 absolute top-4 right-4">In Progress</span>
							</div>
							<div className="bg-base-200 rounded-xl p-5 flex flex-col gap-2 relative">
								<div className="font-semibold">Equipment Safety Inspection</div>
								<div className="text-sm text-gray-500">Not Started • 0/15 items</div>
								<button className="btn btn-sm w-fit bg-primary">Start</button>
								<span className="badge bg-gray-200 text-gray-700 absolute top-4 right-4">Pending</span>
							</div>
							<div className="bg-base-200 rounded-xl p-5 flex flex-col gap-2 relative">
								<div className="font-semibold">Site Hazard Assessment</div>
								<div className="text-sm text-gray-500">11:45 AM • 6/6 items</div>
								<button className="btn btn-outline btn-sm w-fit">View</button>
								<span className="badge bg-black text-white absolute top-4 right-4">Completed</span>
							</div>
						</div>
					</div>
					{/* Quality Control */}
					<div className="bg-base-100 rounded-2xl p-6 shadow flex flex-col gap-4">
						<h2 className="text-2xl font-bold mb-1">Quality Control</h2>
						<p className="text-gray-500 mb-4">
							QA inspections and material checks
						</p>
						{/* QC Score */}
						<div className="bg-green-50 rounded-lg p-6 flex flex-col items-end mb-4">
							<div className="text-gray-500 text-base mb-1">Today's QC Score</div>
							<div className="text-green-600 text-3xl font-bold">94%</div>
							<div className="text-green-600 text-sm">Above target (90%)</div>
						</div>
						{/* Pending Inspections */}
						<div>
							<div className="font-semibold mb-2">Pending Inspections</div>
							<div className="space-y-4">
								<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
									<div className="font-semibold">Concrete Strength Test</div>
									<div className="text-sm text-gray-500">Building A Foundation</div>
									<button className="btn btn-primary btn-sm w-fit mt-1">
										Schedule
									</button>
									<span className="badge bg-red-400 text-white absolute top-4 right-4">Today</span>
								</div>
								<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
									<div className="font-semibold">Rebar Placement Check</div>
									<div className="text-sm text-gray-500">Floor 2 Slab</div>
									<button className="btn btn-primary btn-sm w-fit mt-1">
										Schedule
									</button>
									<span className="badge bg-gray-200 text-gray-700 absolute top-4 right-4">Tomorrow</span>
								</div>
								<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
									<div className="font-semibold">Material Quality Verification</div>
									<div className="text-sm text-gray-500">Delivery Area</div>
									<button className="btn btn-primary btn-sm w-fit mt-1">
										Schedule
									</button>
									<span className="badge bg-red-400 text-white absolute top-4 right-4">Today</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === "issues" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Report New Issue */}
					<div className="bg-base-100 rounded-2xl p-6 shadow">
						<h2 className="text-2xl font-bold mb-1">Issue Reporting</h2>
						<p className="text-gray-500 mb-6">
							Report and track site issues
						</p>
						<h3 className="text-lg font-semibold mb-4">Report New Issue</h3>
						<form className="space-y-4">
							<div>
								<label className="label">
									<span className="label-text font-medium">Issue Type</span>
								</label>
								<select className="select select-bordered w-full">
									<option>Safety Hazard</option>
									<option>Equipment Failure</option>
									<option>Material Shortage</option>
									<option>Other</option>
								</select>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Location</span>
								</label>
								<input
									className="input input-bordered w-full"
									placeholder="Building A, Floor 2..."
								/>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Description</span>
								</label>
								<textarea
									className="textarea textarea-bordered w-full"
									rows={3}
									placeholder="Describe the issue in detail..."
								/>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Priority</span>
								</label>
								<select className="select select-bordered w-full">
									<option>High - Immediate attention</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
							</div>
							<div>
								<label className="label">
									<span className="label-text font-medium">Photos</span>
								</label>
								<div className="flex items-center gap-2">
									<input type="file" className="file-input file-input-bordered w-full" />
									<span className="text-gray-400">Add Photos</span>
								</div>
							</div>
							<button type="submit" className="btn bg-black text-white w-full font-bold mt-2">
								Submit Issue Report
							</button>
						</form>
					</div>
					{/* Recent Issues */}
					<div className="bg-base-100 rounded-2xl p-6 shadow">
						<h3 className="text-xl font-bold mb-4">Recent Issues</h3>
						<div className="space-y-4">
							<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
								<div className="font-semibold">ISS-001: Equipment Failure</div>
								<div className="text-sm text-gray-500">Crane #2 • 2 hours ago</div>
								<div className="flex gap-2 mt-2">
									<span className="badge bg-black text-white">In Progress</span>
									<span className="badge bg-gray-200 text-black">High</span>
								</div>
								<button
									className="btn btn-outline btn-sm w-fit mt-2"
									onClick={() => setOpenIssueId(openIssueId === "ISS-001" ? null : "ISS-001")}
								>
									{openIssueId === "ISS-001" ? "Close" : "View Details"}
								</button>
								{openIssueId === "ISS-001" && (
									<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
										<h4 className="font-bold mb-2">Issue Details</h4>
										<div><strong>ID:</strong> ISS-001</div>
										<div><strong>Type:</strong> Equipment Failure</div>
										<div><strong>Location:</strong> Crane #2</div>
										<div><strong>Status:</strong> In Progress</div>
										<div><strong>Priority:</strong> High</div>
										<div><strong>Reported:</strong> 2 hours ago</div>
										<div className="mt-2"><strong>Description:</strong> Crane #2 stopped working during lift. Maintenance team notified.</div>
									</div>
								)}
							</div>
							<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
								<div className="font-semibold">ISS-002: Material Shortage</div>
								<div className="text-sm text-gray-500">Building A • 1 day ago</div>
								<div className="flex gap-2 mt-2">
									<span className="badge bg-gray-200 text-black">Resolved</span>
									<span className="badge bg-gray-200 text-black">Medium</span>
								</div>
								<button
									className="btn btn-outline btn-sm w-fit mt-2"
									onClick={() => setOpenIssueId(openIssueId === "ISS-002" ? null : "ISS-002")}
								>
									{openIssueId === "ISS-002" ? "Close" : "View Details"}
								</button>
								{openIssueId === "ISS-002" && (
									<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
										<h4 className="font-bold mb-2">Issue Details</h4>
										<div><strong>ID:</strong> ISS-002</div>
										<div><strong>Type:</strong> Material Shortage</div>
										<div><strong>Location:</strong> Building A</div>
										<div><strong>Status:</strong> Resolved</div>
										<div><strong>Priority:</strong> Medium</div>
										<div><strong>Reported:</strong> 1 day ago</div>
										<div className="mt-2"><strong>Description:</strong> Concrete delivery delayed, causing shortfall for pour.</div>
									</div>
								)}
							</div>
							<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-1 relative">
								<div className="font-semibold">ISS-003: Safety Hazard</div>
								<div className="text-sm text-gray-500">Entrance Gate • 3 hours ago</div>
								<div className="flex gap-2 mt-2">
									<span className="badge bg-red-400 text-white">Open</span>
									<span className="badge bg-gray-200 text-black">High</span>
								</div>
								<button
									className="btn btn-outline btn-sm w-fit mt-2"
									onClick={() => setOpenIssueId(openIssueId === "ISS-003" ? null : "ISS-003")}
								>
									{openIssueId === "ISS-003" ? "Close" : "View Details"}
								</button>
								{openIssueId === "ISS-003" && (
									<div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
										<h4 className="font-bold mb-2">Issue Details</h4>
										<div><strong>ID:</strong> ISS-003</div>
										<div><strong>Type:</strong> Safety Hazard</div>
										<div><strong>Location:</strong> Entrance Gate</div>
										<div><strong>Status:</strong> Open</div>
										<div><strong>Priority:</strong> High</div>
										<div><strong>Reported:</strong> 3 hours ago</div>
										<div className="mt-2"><strong>Description:</strong> Oil spill at entrance, cones placed for safety.</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Attendance Popup */}
			{showAttendancePopup && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
						<button
							className="absolute top-2 right-2 text-xl"
							onClick={() => setShowAttendancePopup(false)}
							aria-label="Close"
						>
							&times;
						</button>
						<h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
						<div className="mb-4">Select crew members present today:</div>
						<ul className="space-y-2 mb-4">
							{dummyCrews.flatMap(crew => crew.members).map((member, idx) => (
								<li key={idx} className="flex items-center gap-2">
									<input type="checkbox" id={`attend-${idx}`} className="checkbox" />
									<label htmlFor={`attend-${idx}`}>{member}</label>
								</li>
							))}
						</ul>
						<button
							className="btn btn-primary w-full"
							onClick={() => setShowAttendancePopup(false)}
						>
							Save Attendance
						</button>
					</div>
				</div>
			)}

			{/* Timesheet Popup */}
			{showTimesheetPopup && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
						<button
							className="absolute top-2 right-2 text-xl"
							onClick={() => setShowTimesheetPopup(false)}
							aria-label="Close"
						>
							&times;
						</button>
						<h2 className="text-2xl font-bold mb-4">Crew Timesheets</h2>
						<table className="table w-full mb-4">
							<thead>
								<tr>
									<th className="text-left">Name</th>
									<th className="text-left">Hours</th>
									<th className="text-left">Status</th>
								</tr>
							</thead>
							<tbody>
								{dummyCrews.flatMap(crew => crew.members).map((member, idx) => (
									<tr key={idx}>
										<td>{member}</td>
										<td>8</td>
										<td>Present</td>
									</tr>
								))}
							</tbody>
						</table>
						<button
							className="btn btn-outline w-full"
							onClick={() => setShowTimesheetPopup(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}

			{/* Briefing Popup */}
			{showBriefingPopup && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
						<button
							className="absolute top-2 right-2 text-xl"
							onClick={() => setShowBriefingPopup(false)}
							aria-label="Close"
						>
							&times;
						</button>
						<h2 className="text-2xl font-bold mb-4">Start Daily Briefing</h2>
						<div className="mb-4">
							<strong>Today's Topics:</strong>
							<ul className="list-disc pl-6 mt-2 text-gray-700">
								<li>Safety reminders and PPE check</li>
								<li>Today's work plan and assignments</li>
								<li>Site hazards and restricted areas</li>
								<li>Weather and schedule updates</li>
							</ul>
						</div>
						<textarea
							className="textarea textarea-bordered w-full mb-4"
							rows={3}
							placeholder="Add notes or special instructions for today's briefing..."
						/>
						<button
							className="btn btn-primary w-full"
							onClick={() => setShowBriefingPopup(false)}
						>
							Start Briefing
						</button>
					</div>
				</div>
			)}
		</div>
	);
}