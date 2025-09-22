import { useState } from "react";
import { 
  useProjectBudgetEntries, 
  useProjectBudgetAnalytics,
  useProjectRiskAssessments,
  useProjectRiskAnalytics,
  useCreateBudgetEntry,
  useUpdateBudgetEntry,
  useDeleteBudgetEntry,
  useCreateRiskAssessment,
  useUpdateRiskAssessment,
  useDeleteRiskAssessment,
  type CreateBudgetEntryDto,
  type CreateRiskAssessmentDto,
  type BudgetEntry,
  type RiskAssessment
} from "../hooks/useBudgetRisk";
import { useParams } from "react-router-dom";
import {
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCurrencyDollar,
  HiOutlineShieldExclamation,
} from "react-icons/hi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BudgetRiskManagement = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const [activeTab, setActiveTab] = useState<"budget" | "risk">("budget");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [editingBudgetEntry, setEditingBudgetEntry] = useState<BudgetEntry | null>(null);
  const [editingRiskAssessment, setEditingRiskAssessment] = useState<RiskAssessment | null>(null);

  // API hooks
  const { data: budgetEntries = [] } = useProjectBudgetEntries(projectId || "");
  const { data: budgetAnalytics } = useProjectBudgetAnalytics(projectId || "");
  const { data: riskAssessments = [] } = useProjectRiskAssessments(projectId || "");
  const { data: riskAnalytics } = useProjectRiskAnalytics(projectId || "");

  // Mutations
  const createBudgetMutation = useCreateBudgetEntry();
  const updateBudgetMutation = useUpdateBudgetEntry();
  const deleteBudgetMutation = useDeleteBudgetEntry();
  const createRiskMutation = useCreateRiskAssessment();
  const updateRiskMutation = useUpdateRiskAssessment();
  const deleteRiskMutation = useDeleteRiskAssessment();

  // Budget form handling
  const handleBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;

    const formData = new FormData(e.currentTarget);
    const budgetEntryData: CreateBudgetEntryDto = {
      category: formData.get("category") as string,
      amount: Number(formData.get("amount")),
      budgeted: Number(formData.get("budgeted")) || undefined,
      description: formData.get("description") as string || undefined,
      date: formData.get("date") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      if (editingBudgetEntry) {
        await updateBudgetMutation.mutateAsync({
          projectId,
          entryId: editingBudgetEntry.id,
          budgetEntry: budgetEntryData,
        });
      } else {
        await createBudgetMutation.mutateAsync({
          projectId,
          budgetEntry: budgetEntryData,
        });
      }
      setShowBudgetModal(false);
      setEditingBudgetEntry(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error saving budget entry:", error);
    }
  };

  // Risk form handling
  const handleRiskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;

    const formData = new FormData(e.currentTarget);
    const riskData: CreateRiskAssessmentDto = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      probability: formData.get("probability") as string,
      impact: formData.get("impact") as string,
      owner: formData.get("owner") as string || undefined,
      mitigation: formData.get("mitigation") as string || undefined,
      contingency: formData.get("contingency") as string || undefined,
      cost: Number(formData.get("cost")) || undefined,
      schedule: Number(formData.get("schedule")) || undefined,
    };

    try {
      if (editingRiskAssessment) {
        await updateRiskMutation.mutateAsync({
          projectId,
          riskId: editingRiskAssessment.id,
          riskAssessment: { ...riskData, status: formData.get("status") as string },
        });
      } else {
        await createRiskMutation.mutateAsync({
          projectId,
          riskAssessment: riskData,
        });
      }
      setShowRiskModal(false);
      setEditingRiskAssessment(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error saving risk assessment:", error);
    }
  };

  // Chart configurations
  const budgetChartData = {
    labels: budgetAnalytics?.categoryBreakdown.map(c => c.category) || [],
    datasets: [
      {
        label: "Spent",
        data: budgetAnalytics?.categoryBreakdown.map(c => c.spent) || [],
        backgroundColor: "#EF4444",
      },
      {
        label: "Budgeted",
        data: budgetAnalytics?.categoryBreakdown.map(c => c.budgeted) || [],
        backgroundColor: "#10B981",
      },
    ],
  };

  const riskChartData = {
    labels: ["High Risk", "Medium Risk", "Low Risk"],
    datasets: [
      {
        data: [
          riskAnalytics?.summary.highRisks || 0,
          riskAnalytics?.summary.mediumRisks || 0,
          riskAnalytics?.summary.lowRisks || 0,
        ],
        backgroundColor: ["#EF4444", "#F59E0B", "#10B981"],
      },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 9) return "text-red-600 bg-red-100";
    if (riskScore >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "badge-error";
      case "mitigated": return "badge-warning";
      case "accepted": return "badge-info";
      case "closed": return "badge-success";
      default: return "badge-neutral";
    }
  };

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budget & Risk Management</h1>
          <p className="text-gray-500">Monitor project finances and assess risks</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-bordered mb-6">
        <a
          className={`tab ${activeTab === "budget" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("budget")}
        >
          <HiOutlineCurrencyDollar className="mr-2" />
          Budget Management
        </a>
        <a
          className={`tab ${activeTab === "risk" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("risk")}
        >
          <HiOutlineShieldExclamation className="mr-2" />
          Risk Management
        </a>
      </div>

      {activeTab === "budget" && (
        <div className="space-y-6">
          {/* Budget Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Total Budget</div>
              <div className="stat-value text-primary">
                {formatCurrency(budgetAnalytics?.summary.totalBudgeted || 0)}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Total Spent</div>
              <div className="stat-value text-secondary">
                {formatCurrency(budgetAnalytics?.summary.totalSpent || 0)}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Remaining</div>
              <div className={`stat-value ${budgetAnalytics?.summary.remainingBudget && budgetAnalytics.summary.remainingBudget < 0 ? "text-error" : "text-success"}`}>
                {formatCurrency(budgetAnalytics?.summary.remainingBudget || 0)}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Usage</div>
              <div className={`stat-value ${budgetAnalytics?.summary.isOverBudget ? "text-error" : budgetAnalytics?.summary.isApproachingLimit ? "text-warning" : "text-success"}`}>
                {budgetAnalytics?.summary.spentPercentage.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {/* Budget Chart and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-base-100 p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Budget Breakdown</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={budgetChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Budget Entries</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowBudgetModal(true)}
                >
                  <HiOutlinePlusCircle className="mr-1" />
                  Add Entry
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {budgetEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2 bg-base-200 rounded">
                    <div>
                      <div className="font-medium">{entry.category}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(entry.amount)}</div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setEditingBudgetEntry(entry);
                          setShowBudgetModal(true);
                        }}
                      >
                        <HiOutlinePencil />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => deleteBudgetMutation.mutate({ projectId, entryId: entry.id })}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-6">
          {/* Risk Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Total Risks</div>
              <div className="stat-value text-primary">
                {riskAnalytics?.summary.totalRisks || 0}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">High Risks</div>
              <div className="stat-value text-error">
                {riskAnalytics?.summary.highRisks || 0}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Open Risks</div>
              <div className="stat-value text-warning">
                {riskAnalytics?.summary.openRisks || 0}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl shadow">
              <div className="stat-title">Cost Impact</div>
              <div className="stat-value text-secondary">
                {formatCurrency(riskAnalytics?.summary.totalCostImpact || 0)}
              </div>
            </div>
          </div>

          {/* Risk Chart and List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-base-100 p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Risk Distribution</h3>
              </div>
              <div className="h-64">
                <Doughnut
                  data={riskChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Risk Assessments</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRiskModal(true)}
                >
                  <HiOutlinePlusCircle className="mr-1" />
                  Add Risk
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {riskAssessments.map((risk) => (
                  <div key={risk.id} className="p-3 bg-base-200 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{risk.title}</div>
                        <div className="text-sm text-gray-500 mb-1">{risk.category}</div>
                        <div className="flex space-x-2">
                          <span className={`badge badge-xs ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </span>
                          <span className={`badge badge-xs ${getRiskColor(risk.riskScore)}`}>
                            Score: {risk.riskScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setEditingRiskAssessment(risk);
                            setShowRiskModal(true);
                          }}
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => deleteRiskMutation.mutate({ projectId, riskId: risk.id })}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Entry Modal */}
      {showBudgetModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingBudgetEntry ? "Edit Budget Entry" : "Add Budget Entry"}
            </h3>
            <form onSubmit={handleBudgetSubmit} className="space-y-4 mt-4">
              <div>
                <label className="label">Category</label>
                <select name="category" className="select select-bordered w-full" defaultValue={editingBudgetEntry?.category} required>
                  <option value="">Select category</option>
                  <option value="Labor">Labor</option>
                  <option value="Materials">Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Permits">Permits</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount Spent</label>
                  <input
                    type="number"
                    name="amount"
                    className="input input-bordered w-full"
                    defaultValue={editingBudgetEntry?.amount}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Budgeted Amount</label>
                  <input
                    type="number"
                    name="budgeted"
                    className="input input-bordered w-full"
                    defaultValue={editingBudgetEntry?.budgeted}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  name="description"
                  className="input input-bordered w-full"
                  defaultValue={editingBudgetEntry?.description}
                  placeholder="Brief description of the expense"
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="input input-bordered w-full"
                  defaultValue={editingBudgetEntry?.date ? new Date(editingBudgetEntry.date).toISOString().split('T')[0] : ''}
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  className="textarea textarea-bordered w-full"
                  defaultValue={editingBudgetEntry?.notes}
                  placeholder="Additional notes"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => {
                  setShowBudgetModal(false);
                  setEditingBudgetEntry(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudgetEntry ? "Update" : "Add"} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Assessment Modal */}
      {showRiskModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">
              {editingRiskAssessment ? "Edit Risk Assessment" : "Add Risk Assessment"}
            </h3>
            <form onSubmit={handleRiskSubmit} className="space-y-4 mt-4">
              <div>
                <label className="label">Risk Title</label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  defaultValue={editingRiskAssessment?.title}
                  required
                  placeholder="Brief title for the risk"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full"
                  defaultValue={editingRiskAssessment?.description}
                  required
                  placeholder="Detailed description of the risk"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select name="category" className="select select-bordered w-full" defaultValue={editingRiskAssessment?.category} required>
                    <option value="">Select category</option>
                    <option value="Safety">Safety</option>
                    <option value="Financial">Financial</option>
                    <option value="Schedule">Schedule</option>
                    <option value="Quality">Quality</option>
                    <option value="Weather">Weather</option>
                    <option value="Regulatory">Regulatory</option>
                  </select>
                </div>
                <div>
                  <label className="label">Probability</label>
                  <select name="probability" className="select select-bordered w-full" defaultValue={editingRiskAssessment?.probability} required>
                    <option value="">Select probability</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Impact</label>
                  <select name="impact" className="select select-bordered w-full" defaultValue={editingRiskAssessment?.impact} required>
                    <option value="">Select impact</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              {editingRiskAssessment && (
                <div>
                  <label className="label">Status</label>
                  <select name="status" className="select select-bordered w-full" defaultValue={editingRiskAssessment?.status}>
                    <option value="Open">Open</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">Risk Owner</label>
                <input
                  type="text"
                  name="owner"
                  className="input input-bordered w-full"
                  defaultValue={editingRiskAssessment?.owner}
                  placeholder="Person responsible for this risk"
                />
              </div>
              <div>
                <label className="label">Mitigation Strategy</label>
                <textarea
                  name="mitigation"
                  className="textarea textarea-bordered w-full"
                  defaultValue={editingRiskAssessment?.mitigation}
                  placeholder="How to prevent or reduce this risk"
                />
              </div>
              <div>
                <label className="label">Contingency Plan</label>
                <textarea
                  name="contingency"
                  className="textarea textarea-bordered w-full"
                  defaultValue={editingRiskAssessment?.contingency}
                  placeholder="What to do if the risk occurs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cost Impact ($)</label>
                  <input
                    type="number"
                    name="cost"
                    className="input input-bordered w-full"
                    defaultValue={editingRiskAssessment?.cost}
                    min="0"
                    step="0.01"
                    placeholder="Potential financial impact"
                  />
                </div>
                <div>
                  <label className="label">Schedule Impact (days)</label>
                  <input
                    type="number"
                    name="schedule"
                    className="input input-bordered w-full"
                    defaultValue={editingRiskAssessment?.schedule}
                    min="0"
                    placeholder="Potential delay in days"
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => {
                  setShowRiskModal(false);
                  setEditingRiskAssessment(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRiskAssessment ? "Update" : "Add"} Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetRiskManagement;