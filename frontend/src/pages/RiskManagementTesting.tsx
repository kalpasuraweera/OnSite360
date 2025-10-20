import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import type { UserProject } from "../hooks/useUsers";
import { useProjectPhases, type ProjectPhase } from "../hooks/useSchedule";
import {
  useProject,
  useProjectExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  type Expense,
} from "../hooks/useProjects";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const RiskManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { data: projects = [] } = useUserProjects(user?.id || "");
  const [selectedProject, setSelectedProject] = useState<string>(
    projects?.[0]?.id || ""
  );

  // project details (includes costToDate)
  const { data: projectDetail } = useProject(selectedProject);

  // expenses from backend
  const { data: expenses = [], refetch: refetchExpenses } =
    useProjectExpenses(selectedProject);

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // show modal state and editing expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // file attachments (for create/update) - stored in parent to persist across modal
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(
    null
  );

  // Alert visibility and computed message (default hidden)
  const [showRiskAlert, setShowRiskAlert] = useState<boolean>(false);
  const [riskMessage, setRiskMessage] = useState<string>("");

  // schedule-based insights
  const { data: projectPhases = [] } = useProjectPhases(selectedProject);

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Simple analytics data derived from local expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const category = e.category || "No Category";
      map[category] = (map[category] || 0) + (e.amount || 0);
    });
    return map;
  }, [expenses]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(expenseByCategory);
    const data = labels.map((l) => expenseByCategory[l]);
    return {
      labels,
      datasets: [
        {
          label: "Expenses",
          data,
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
    };
  }, [expenseByCategory]);

  // (expenses over time chart was removed for brevity)

  // budget / spent
  const projectBudget = useMemo(() => {
    const p = (projects as UserProject[]).find(
      (x) => x.id === selectedProject
    ) as UserProject | undefined;
    return p?.budget || 0;
  }, [projects, selectedProject]);

  // Use project's costToDate when available as total spent
  const totalSpent = useMemo(() => {
    if (projectDetail && typeof projectDetail.costToDate === "number") {
      return projectDetail.costToDate;
    }
    // fallback to summing fetched expenses
    return (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  }, [projectDetail, expenses]);

  const budgetBarData = useMemo(
    () => ({
      labels: ["Budget", "Spent"],
      datasets: [
        {
          label: "Amount",
          data: [projectBudget, totalSpent],
          backgroundColor: ["#06b6d4", "#ef4444"],
        },
      ],
    }),
    [projectBudget, totalSpent]
  );

  // Compute alert visibility/message when relevant data changes
  useEffect(() => {
    // Determine over-budget
    const overBudget =
      typeof projectBudget === "number" &&
      typeof totalSpent === "number" &&
      totalSpent > projectBudget;

    // Determine overdue phases (progress < 100 and endDate before today)
    const today = new Date();
    const overduePhases = (projectPhases || []).filter((ph) => {
      if (!ph.endDate) return false;
      const end = new Date(ph.endDate);
      return (ph.progress ?? 0) < 100 && end < today;
    });

    // Build message based on conditions
    let message = "";
    if (overBudget && overduePhases.length > 0) {
      const overBy = (totalSpent - projectBudget).toFixed(2);
      message = `Project is over budget by $${overBy} and ${overduePhases.length} phase(s) are past their end date but not complete.`;
    } else if (overBudget) {
      const overBy = (totalSpent - projectBudget).toFixed(2);
      message = `Project is over budget by $${overBy}.`;
    } else if (overduePhases.length > 0) {
      message = `${overduePhases.length} phase(s) are past their end date but not complete.`;
    }

    setRiskMessage(message);
    setShowRiskAlert(!!message);
  }, [projectBudget, totalSpent, projectPhases, selectedProject]);

  // time/schedule insights
  const plannedDays = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    return projectPhases.reduce((sum: number, ph: ProjectPhase) => {
      const start = new Date(ph.startDate).getTime();
      const end = new Date(ph.endDate).getTime();
      const days = Math.max(
        0,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      );
      return sum + days;
    }, 0);
  }, [projectPhases]);

  const averagePhaseProgress = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    const sum = projectPhases.reduce((s, p) => s + (p.progress || 0), 0);
    return Math.round(sum / projectPhases.length);
  }, [projectPhases]);

  // Build line chart data for phases over time
  const phaseLineData = useMemo<ChartData<"line"> | null>(() => {
    if (!projectPhases || projectPhases.length === 0) return null;

    // gather unique sorted dates (start and end of phases)
    const dates = new Set<string>();
    projectPhases.forEach((ph) => {
      dates.add(ph.startDate.split("T")[0]);
      dates.add(ph.endDate.split("T")[0]);
    });
    const labels = Array.from(dates).sort();

    // For each phase, create a dataset where the value is 0 before start, phase.progress at end
    const datasets = projectPhases.map((ph, idx) => {
      const data = labels.map((d) => {
        if (d < ph.startDate.split("T")[0]) return 0;
        if (d >= ph.endDate.split("T")[0]) return ph.progress || 0;
        // between start and end interpolate linearly toward progress
        const start = new Date(ph.startDate).getTime();
        const end = new Date(ph.endDate).getTime();
        const cur = new Date(d).getTime();
        if (end === start) return ph.progress || 0;
        const t = Math.min(1, Math.max(0, (cur - start) / (end - start)));
        return Math.round((ph.progress || 0) * t);
      });

      const colors = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
      ];
      return {
        label: ph.name,
        data,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + "33",
        tension: 0.2,
        fill: false,
      };
    });

    return { labels, datasets } as unknown as ChartData<"line">;
  }, [projectPhases]);

  // CRUD handlers calling API
  const handleAddExpense = () => {
    setEditingExpense(null);
    setSelectedReceiptFile(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (e: Expense) => {
    setEditingExpense(e);
    setSelectedReceiptFile(null); // user may upload a new receipt if needed
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!selectedProject) return;
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpenseMutation.mutateAsync({
        projectId: selectedProject,
        expenseId: id,
      });
      // refetch handled by react-query invalidation; optionally refetch local snapshot
      await refetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("Failed to delete expense");
    }
  };

  const handleSaveExpense = async (form: {
    id?: string;
    date?: string;
    category?: string;
    amount?: number;
    vendor?: string;
    notes?: string;
    currency?: string;
    isReimbursable?: boolean;
  }) => {
    if (!selectedProject) {
      alert("Select a project first");
      return;
    }
    try {
      if (editingExpense && editingExpense.id) {
        await updateExpenseMutation.mutateAsync({
          projectId: selectedProject,
          expenseId: editingExpense.id,
          expense: {
            amount: form.amount,
            category: form.category,
            vendor: form.vendor,
            date: form.date,
            notes: form.notes,
            currency: form.currency,
            isReimbursable: form.isReimbursable,
          },
          file: selectedReceiptFile ?? undefined,
        });
      } else {
        await createExpenseMutation.mutateAsync({
          projectId: selectedProject,
          expense: {
            amount: form.amount!,
            category: form.category,
            vendor: form.vendor,
            date: form.date,
            notes: form.notes,
            currency: form.currency,
            isReimbursable: form.isReimbursable,
          },
          file: selectedReceiptFile ?? undefined,
        });
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
      setSelectedReceiptFile(null);
      await refetchExpenses();
    } catch (err) {
      console.error("Failed to save expense:", err);
      alert("Failed to save expense");
    }
  };

  // Handle print report
  const handlePrintReport = () => {
    // Create a printable version of the expenses table
    const printContent = `
      <html>
        <head>
          <title>Expense Report - ${projects.find((p: UserProject) => p.id === selectedProject)?.name || 'Project'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
            .meta { margin-bottom: 20px; font-size: 14px; }
            .meta div { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="meta">
            <div><strong>Project:</strong> ${projects.find((p: UserProject) => p.id === selectedProject)?.name || 'Unknown'}</div>
            <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div><strong>Total Expenses:</strong> $${totalSpent.toFixed(2)}</div>
            <div><strong>Budget:</strong> $${projectBudget.toFixed(2)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((e) => `
                <tr>
                  <td>${new Date(e.date).toISOString().split("T")[0]}</td>
                  <td>${e.category || '-'}</td>
                  <td>${e.vendor || '-'}</td>
                  <td>$${(e.amount || 0).toFixed(2)}</td>
                  <td>${e.notes || '-'}</td>
                </tr>
              `).join('')}
              ${(!expenses || expenses.length === 0) ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px;">No expenses found for this project.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          <div class="footer">
            Generated from OnSite360 Construction Management System
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = function() {
        printWindow.print();
        // printWindow.close(); // Uncomment to auto-close after print dialog
      };
    } else {
      alert('Please allow pop-ups to print the expense report.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6">
        {showRiskAlert && (
          <div className="alert alert-warning shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Project Risk Alert</h3>
              <div className="text-xs">{riskMessage}</div>
            </div>

            <div className="flex-none">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowRiskAlert(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-gray-500 mt-1">
              View risk analytics and expense records per project.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="min-w-[240px]">
              <label className="label">
                <span className="label-text">Project</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                {projects.map((p: UserProject) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Budget vs Spent</h3>
          <div style={{ height: 220 }}>
            <Bar data={budgetBarData} />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Budget: ${projectBudget.toFixed(2)} • Spent: $
            {totalSpent.toFixed(2)} • Remaining: $
            {(projectBudget - totalSpent).toFixed(2)}
            {projectDetail && (
              <div className="text-xs text-gray-400 mt-1">
                (Project costToDate: ${projectDetail.costToDate ?? 0})
              </div>
            )}
        </div>
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Expense Distribution</h3>
          <Doughnut data={doughnutData} />
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Schedule / Time</h3>
          <div className="mb-3 text-sm text-gray-600">
            Planned days: <strong>{plannedDays}</strong>
          </div>
          {phaseLineData ? (
            <>
              <div style={{ height: 220 }}>
                <Line
                  data={phaseLineData}
                  options={{
                    scales: {
                      x: { title: { display: true, text: "Date" } },
                      y: {
                        title: { display: true, text: "Progress (%)" },
                        min: 0,
                        max: 100,
                      },
                    },
                    plugins: { legend: { display: true, position: "bottom" } },
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Average phase progress: <strong>{averagePhaseProgress}%</strong>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No phase data available</div>
          )}
        </div>
      </div>

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Expense Records</h3>
          <div className="flex items-center gap-4">
            <button
              className="btn btn-sm btn-outline"
              onClick={handlePrintReport}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Invoice</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(expenses || []).map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toISOString().split("T")[0]}</td>
                  <td>{e.category}</td>
                  <td>{e.vendor}</td>
                  <td>${(e.amount || 0).toFixed(2)}</td>
                  <td>
                    {e.receiptUrl ? (
                      <a
                        href={`${
                          import.meta.env.VITE_DOCUMENTS_URL ||
                          "http://localhost:3000"
                        }${e.receiptUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td>{e.notes}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs"
                        onClick={() => handleEditExpense(e)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteExpense(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!expenses || expenses.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No expenses found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense modal */}
      {showExpenseModal && (
        <ExpenseModal
          show={showExpenseModal}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
            setSelectedReceiptFile(null);
          }}
          onSave={handleSaveExpense}
          expense={editingExpense ?? undefined}
          selectedFile={selectedReceiptFile}
          onFileChange={(file) => setSelectedReceiptFile(file)}
        />
      )}
    </div>
  );
};

// Expense Modal component (now supports receipt file)
const ExpenseModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (expense: {
    id?: string;
    date?: string;
    category?: string;
    amount?: number;
    vendor?: string;
    notes?: string;
    currency?: string;
    isReimbursable?: boolean;
  }) => void;
  expense?: Expense;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}> = ({ show, onClose, onSave, expense, selectedFile, onFileChange }) => {
  const [form, setForm] = useState({
    id: expense?.id ?? "",
    date: expense
      ? new Date(expense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: expense?.category ?? "",
    amount: expense?.amount ?? 0,
    vendor: expense?.vendor ?? "",
    notes: expense?.notes ?? "",
    currency: expense?.currency ?? "USD",
    isReimbursable: false,
  });

  useEffect(() => {
    if (expense) {
      setForm({
        id: expense.id,
        date: new Date(expense.date).toISOString().split("T")[0],
        category: expense.category ?? "",
        amount: expense.amount ?? 0,
        vendor: expense.vendor ?? "",
        notes: expense.notes ?? "",
        currency: expense.currency ?? "USD",
        isReimbursable: false,
      });
    }
  }, [expense]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (onFileChange) onFileChange(f ?? null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.vendor || !form.amount) {
      alert("Please fill required fields: category, vendor, amount");
      return;
    }
    onSave({
      id: form.id || undefined,
      date: form.date,
      category: form.category,
      amount: form.amount,
      vendor: form.vendor,
      notes: form.notes,
      currency: form.currency,
      isReimbursable: form.isReimbursable,
    });
  };

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">
          {expense ? "Edit Expense" : "Add Expense"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text">Vendor</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Receipt / Invoice</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileInput}
              className="file-input file-input-bordered w-full"
            />
            {expense?.receiptUrl && !selectedFile && (
              <div className="text-sm mt-2">
                Existing:{" "}
                <a
                  href={`${
                    import.meta.env.VITE_DOCUMENTS_URL ||
                    "http://localhost:3000"
                  }${expense.receiptUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  View invoice
                </a>
              </div>
            )}
            {selectedFile && (
              <div className="text-sm mt-2">Selected: {selectedFile.name}</div>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Note</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskManagement;

import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import type { UserProject } from "../hooks/useUsers";
import { useProjectPhases, type ProjectPhase } from "../hooks/useSchedule";
import {
  useProject,
  useProjectExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  type Expense,
} from "../hooks/useProjects";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const RiskManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { data: projects = [] } = useUserProjects(user?.id || "");
  const [selectedProject, setSelectedProject] = useState<string>(
    projects?.[0]?.id || ""
  );

  // project details (includes costToDate)
  const { data: projectDetail } = useProject(selectedProject);

  // expenses from backend
  const { data: expenses = [], refetch: refetchExpenses } =
    useProjectExpenses(selectedProject);

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // show modal state and editing expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // file attachments (for create/update) - stored in parent to persist across modal
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(
    null
  );

  // Alert visibility and computed message (default hidden)
  const [showRiskAlert, setShowRiskAlert] = useState<boolean>(false);
  const [riskMessage, setRiskMessage] = useState<string>("");

  // schedule-based insights
  const { data: projectPhases = [] } = useProjectPhases(selectedProject);

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Simple analytics data derived from local expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const category = e.category || "No Category";
      map[category] = (map[category] || 0) + (e.amount || 0);
    });
    return map;
  }, [expenses]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(expenseByCategory);
    const data = labels.map((l) => expenseByCategory[l]);
    return {
      labels,
      datasets: [
        {
          label: "Expenses",
          data,
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
    };
  }, [expenseByCategory]);

  // (expenses over time chart was removed for brevity)

  // budget / spent
  const projectBudget = useMemo(() => {
    const p = (projects as UserProject[]).find(
      (x) => x.id === selectedProject
    ) as UserProject | undefined;
    return p?.budget || 0;
  }, [projects, selectedProject]);

  // Use project's costToDate when available as total spent
  const totalSpent = useMemo(() => {
    if (projectDetail && typeof projectDetail.costToDate === "number") {
      return projectDetail.costToDate;
    }
    // fallback to summing fetched expenses
    return (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  }, [projectDetail, expenses]);

  const budgetBarData = useMemo(
    () => ({
      labels: ["Budget", "Spent"],
      datasets: [
        {
          label: "Amount",
          data: [projectBudget, totalSpent],
          backgroundColor: ["#06b6d4", "#ef4444"],
        },
      ],
    }),
    [projectBudget, totalSpent]
  );

  // Compute alert visibility/message when relevant data changes
  useEffect(() => {
    // Determine over-budget
    const overBudget =
      typeof projectBudget === "number" &&
      typeof totalSpent === "number" &&
      totalSpent > projectBudget;

    // Determine overdue phases (progress < 100 and endDate before today)
    const today = new Date();
    const overduePhases = (projectPhases || []).filter((ph) => {
      if (!ph.endDate) return false;
      const end = new Date(ph.endDate);
      return (ph.progress ?? 0) < 100 && end < today;
    });

    // Build message based on conditions
    let message = "";
    if (overBudget && overduePhases.length > 0) {
      const overBy = (totalSpent - projectBudget).toFixed(2);
      message = `Project is over budget by $${overBy} and ${overduePhases.length} phase(s) are past their end date but not complete.`;
    } else if (overBudget) {
      const overBy = (totalSpent - projectBudget).toFixed(2);
      message = `Project is over budget by $${overBy}.`;
    } else if (overduePhases.length > 0) {
      message = `${overduePhases.length} phase(s) are past their end date but not complete.`;
    }

    setRiskMessage(message);
    setShowRiskAlert(!!message);
  }, [projectBudget, totalSpent, projectPhases, selectedProject]);

  // time/schedule insights
  const plannedDays = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    return projectPhases.reduce((sum: number, ph: ProjectPhase) => {
      const start = new Date(ph.startDate).getTime();
      const end = new Date(ph.endDate).getTime();
      const days = Math.max(
        0,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      );
      return sum + days;
    }, 0);
  }, [projectPhases]);

  const averagePhaseProgress = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    const sum = projectPhases.reduce((s, p) => s + (p.progress || 0), 0);
    return Math.round(sum / projectPhases.length);
  }, [projectPhases]);

  // Build line chart data for phases over time
  const phaseLineData = useMemo<ChartData<"line"> | null>(() => {
    if (!projectPhases || projectPhases.length === 0) return null;

    // gather unique sorted dates (start and end of phases)
    const dates = new Set<string>();
    projectPhases.forEach((ph) => {
      dates.add(ph.startDate.split("T")[0]);
      dates.add(ph.endDate.split("T")[0]);
    });
    const labels = Array.from(dates).sort();

    // For each phase, create a dataset where the value is 0 before start, phase.progress at end
    const datasets = projectPhases.map((ph, idx) => {
      const data = labels.map((d) => {
        if (d < ph.startDate.split("T")[0]) return 0;
        if (d >= ph.endDate.split("T")[0]) return ph.progress || 0;
        // between start and end interpolate linearly toward progress
        const start = new Date(ph.startDate).getTime();
        const end = new Date(ph.endDate).getTime();
        const cur = new Date(d).getTime();
        if (end === start) return ph.progress || 0;
        const t = Math.min(1, Math.max(0, (cur - start) / (end - start)));
        return Math.round((ph.progress || 0) * t);
      });

      const colors = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
      ];
      return {
        label: ph.name,
        data,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + "33",
        tension: 0.2,
        fill: false,
      };
    });

    return { labels, datasets } as unknown as ChartData<"line">;
  }, [projectPhases]);

  // CRUD handlers calling API
  const handleAddExpense = () => {
    setEditingExpense(null);
    setSelectedReceiptFile(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (e: Expense) => {
    setEditingExpense(e);
    setSelectedReceiptFile(null); // user may upload a new receipt if needed
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!selectedProject) return;
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpenseMutation.mutateAsync({
        projectId: selectedProject,
        expenseId: id,
      });
      // refetch handled by react-query invalidation; optionally refetch local snapshot
      await refetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("Failed to delete expense");
    }
  };

  const handleSaveExpense = async (form: {
    id?: string;
    date?: string;
    category?: string;
    amount?: number;
    vendor?: string;
    notes?: string;
    currency?: string;
    isReimbursable?: boolean;
  }) => {
    if (!selectedProject) {
      alert("Select a project first");
      return;
    }
    try {
      if (editingExpense && editingExpense.id) {
        await updateExpenseMutation.mutateAsync({
          projectId: selectedProject,
          expenseId: editingExpense.id,
          expense: {
            amount: form.amount,
            category: form.category,
            vendor: form.vendor,
            date: form.date,
            notes: form.notes,
            currency: form.currency,
            isReimbursable: form.isReimbursable,
          },
          file: selectedReceiptFile ?? undefined,
        });
      } else {
        await createExpenseMutation.mutateAsync({
          projectId: selectedProject,
          expense: {
            amount: form.amount!,
            category: form.category,
            vendor: form.vendor,
            date: form.date,
            notes: form.notes,
            currency: form.currency,
            isReimbursable: form.isReimbursable,
          },
          file: selectedReceiptFile ?? undefined,
        });
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
      setSelectedReceiptFile(null);
      await refetchExpenses();
    } catch (err) {
      console.error("Failed to save expense:", err);
      alert("Failed to save expense");
    }
  };

  // Handle print report
  const handlePrintReport = () => {
    // Create a printable version of the expenses table
    const printContent = `
      <html>
        <head>
          <title>Expense Report - ${projects.find((p: UserProject) => p.id === selectedProject)?.name || 'Project'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
            .meta { margin-bottom: 20px; font-size: 14px; }
            .meta div { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="meta">
            <div><strong>Project:</strong> ${projects.find((p: UserProject) => p.id === selectedProject)?.name || 'Unknown'}</div>
            <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div><strong>Total Expenses:</strong> $${totalSpent.toFixed(2)}</div>
            <div><strong>Budget:</strong> $${projectBudget.toFixed(2)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((e) => `
                <tr>
                  <td>${new Date(e.date).toISOString().split("T")[0]}</td>
                  <td>${e.category || '-'}</td>
                  <td>${e.vendor || '-'}</td>
                  <td>$${(e.amount || 0).toFixed(2)}</td>
                  <td>${e.notes || '-'}</td>
                </tr>
              `).join('')}
              ${(!expenses || expenses.length === 0) ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px;">No expenses found for this project.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          <div class="footer">
            Generated from OnSite360 Construction Management System
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = function() {
        printWindow.print();
        // printWindow.close(); // Uncomment to auto-close after print dialog
      };
    } else {
      alert('Please allow pop-ups to print the expense report.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6">
        {showRiskAlert && (
          <div className="alert alert-warning shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Project Risk Alert</h3>
              <div className="text-xs">{riskMessage}</div>
            </div>

            <div className="flex-none">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowRiskAlert(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-gray-500 mt-1">
              View risk analytics and expense records per project.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="min-w-[240px]">
              <label className="label">
                <span className="label-text">Project</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                {projects.map((p: UserProject) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Budget vs Spent</h3>
          <div style={{ height: 220 }}>
            <Bar data={budgetBarData} />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Budget: ${projectBudget.toFixed(2)} • Spent: $
            {totalSpent.toFixed(2)} • Remaining: $
            {(projectBudget - totalSpent).toFixed(2)}
            {projectDetail && (
              <div className="text-xs text-gray-400 mt-1">
                (Project costToDate: ${projectDetail.costToDate ?? 0})
              </div>
            )}
        </div>
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Expense Distribution</h3>
          <Doughnut data={doughnutData} />
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Schedule / Time</h3>
          <div className="mb-3 text-sm text-gray-600">
            Planned days: <strong>{plannedDays}</strong>
          </div>
          {phaseLineData ? (
            <>
              <div style={{ height: 220 }}>
                <Line
                  data={phaseLineData}
                  options={{
                    scales: {
                      x: { title: { display: true, text: "Date" } },
                      y: {
                        title: { display: true, text: "Progress (%)" },
                        min: 0,
                        max: 100,
                      },
                    },
                    plugins: { legend: { display: true, position: "bottom" } },
                  }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Average phase progress: <strong>{averagePhaseProgress}%</strong>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No phase data available</div>
          )}
        </div>
      </div>

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Expense Records</h3>
          <div className="flex items-center gap-4">
            <button
              className="btn btn-sm btn-outline"
              onClick={handlePrintReport}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Invoice</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(expenses || []).map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toISOString().split("T")[0]}</td>
                  <td>{e.category}</td>
                  <td>{e.vendor}</td>
                  <td>${(e.amount || 0).toFixed(2)}</td>
                  <td>
                    {e.receiptUrl ? (
                      <a
                        href={`${
                          import.meta.env.VITE_DOCUMENTS_URL ||
                          "http://localhost:3000"
                        }${e.receiptUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td>{e.notes}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs"
                        onClick={() => handleEditExpense(e)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteExpense(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!expenses || expenses.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No expenses found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense modal */}
      {showExpenseModal && (
        <ExpenseModal
          show={showExpenseModal}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
            setSelectedReceiptFile(null);
          }}
          onSave={handleSaveExpense}
          expense={editingExpense ?? undefined}
          selectedFile={selectedReceiptFile}
          onFileChange={(file) => setSelectedReceiptFile(file)}
        />
      )}
    </div>
  );
};

// Expense Modal component (now supports receipt file)
const ExpenseModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (expense: {
    id?: string;
    date?: string;
    category?: string;
    amount?: number;
    vendor?: string;
    notes?: string;
    currency?: string;
    isReimbursable?: boolean;
  }) => void;
  expense?: Expense;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}> = ({ show, onClose, onSave, expense, selectedFile, onFileChange }) => {
  const [form, setForm] = useState({
    id: expense?.id ?? "",
    date: expense
      ? new Date(expense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: expense?.category ?? "",
    amount: expense?.amount ?? 0,
    vendor: expense?.vendor ?? "",
    notes: expense?.notes ?? "",
    currency: expense?.currency ?? "USD",
    isReimbursable: false,
  });

  useEffect(() => {
    if (expense) {
      setForm({
        id: expense.id,
        date: new Date(expense.date).toISOString().split("T")[0],
        category: expense.category ?? "",
        amount: expense.amount ?? 0,
        vendor: expense.vendor ?? "",
        notes: expense.notes ?? "",
        currency: expense.currency ?? "USD",
        isReimbursable: false,
      });
    }
  }, [expense]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (onFileChange) onFileChange(f ?? null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.vendor || !form.amount) {
      alert("Please fill required fields: category, vendor, amount");
      return;
    }
    onSave({
      id: form.id || undefined,
      date: form.date,
      category: form.category,
      amount: form.amount,
      vendor: form.vendor,
      notes: form.notes,
      currency: form.currency,
      isReimbursable: form.isReimbursable,
    });
  };

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">
          {expense ? "Edit Expense" : "Add Expense"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text">Vendor</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Receipt / Invoice</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileInput}
              className="file-input file-input-bordered w-full"
            />
            {expense?.receiptUrl && !selectedFile && (
              <div className="text-sm mt-2">
                Existing:{" "}
                <a
                  href={`${
                    import.meta.env.VITE_DOCUMENTS_URL ||
                    "http://localhost:3000"
                  }${expense.receiptUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  View invoice
                </a>
              </div>
            )}
            {selectedFile && (
              <div className="text-sm mt-2">Selected: {selectedFile.name}</div>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Note</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskManagement;

