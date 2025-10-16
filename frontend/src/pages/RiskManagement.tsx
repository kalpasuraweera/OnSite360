import React, { useMemo, useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import type { UserProject } from "../hooks/useUsers";
import { useProjectPhases, type ProjectPhase } from "../hooks/useSchedule";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const dummyExpenses = [
  { id: '1', date: '2025-10-01', category: 'Materials', amount: 1250.5, vendor: 'ABC Supplies', note: 'Concrete and rebar' },
  { id: '2', date: '2025-10-03', category: 'Labor', amount: 860.0, vendor: 'WorkerCo', note: 'Overtime' },
  { id: '3', date: '2025-10-07', category: 'Equipment', amount: 430.25, vendor: 'EquipRentals', note: 'Mini excavator' },
  { id: '4', date: '2025-10-10', category: 'Permits', amount: 120.0, vendor: 'City Hall', note: 'Permit fees' },
  { id: '5', date: '2025-10-12', category: 'Materials', amount: 540.0, vendor: 'XYZ Lumber', note: 'Framing lumber' },
];

interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  amount: number;
  vendor: string;
  note?: string;
}

const RiskManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { data: projects = [] } = useUserProjects(user?.id || "");
  const [selectedProject, setSelectedProject] = useState<string>(projects?.[0]?.id || "");

  // schedule-based insights
  const { data: projectPhases = [] } = useProjectPhases(selectedProject);

  // local expense state and modal
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => dummyExpenses.map((d) => ({ ...d })));
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Simple analytics data derived from local expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
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
          label: 'Expenses',
          data,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
          ],
        },
      ],
    };
  }, [expenseByCategory]);

  // (expenses over time chart was removed for brevity)

  // budget / spent
  const projectBudget = useMemo(() => {
    const p = (projects as UserProject[]).find((x) => x.id === selectedProject) as UserProject | undefined;
    return p?.budget || 0;
  }, [projects, selectedProject]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const budgetBarData = useMemo(() => ({
    labels: ['Budget', 'Spent'],
    datasets: [
      { label: 'Amount', data: [projectBudget, totalSpent], backgroundColor: ['#06b6d4', '#ef4444'] },
    ],
  }), [projectBudget, totalSpent]);

  // time/schedule insights
  const plannedDays = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    return projectPhases.reduce((sum: number, ph: ProjectPhase) => {
      const start = new Date(ph.startDate).getTime();
      const end = new Date(ph.endDate).getTime();
      const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return sum + days;
    }, 0);
  }, [projectPhases]);

  const averagePhaseProgress = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    const sum = projectPhases.reduce((s, p) => s + (p.progress || 0), 0);
    return Math.round(sum / projectPhases.length);
  }, [projectPhases]);

  // CRUD handlers (local only)
  const handleAddExpense = () => { setEditingExpense(null); setShowExpenseModal(true); };
  const handleEditExpense = (e: ExpenseItem) => { setEditingExpense(e); setShowExpenseModal(true); };
  const handleDeleteExpense = (id: string) => { if (window.confirm('Delete this expense?')) setExpenses((prev) => prev.filter((x) => x.id !== id)); };
  const handleSaveExpense = (exp: ExpenseItem) => {
    if (editingExpense) setExpenses((prev) => prev.map((p) => p.id === exp.id ? exp : p));
    else setExpenses((prev) => [{ ...exp, id: String(Date.now()) }, ...prev]);
    setShowExpenseModal(false); setEditingExpense(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Risk Management</h1>
          <p className="text-gray-500 mt-1">View risk analytics and expense records per project.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Budget vs Spent</h3>
          <div style={{ height: 220 }}><Bar data={budgetBarData} /></div>
          <div className="mt-3 text-sm text-gray-500">Budget: ${projectBudget.toFixed(2)} • Spent: ${totalSpent.toFixed(2)} • Remaining: ${(projectBudget - totalSpent).toFixed(2)}</div>
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Expense Distribution</h3>
          <Doughnut data={doughnutData} />
        </div>

        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <h3 className="font-semibold mb-2">Schedule / Time</h3>
          <div className="mb-3 text-sm text-gray-600">Planned days: <strong>{plannedDays}</strong></div>
          <div className="mb-2 text-sm text-gray-600">Average phase progress: <strong>{averagePhaseProgress}%</strong></div>
          <div className="w-full bg-base-100 rounded-full h-4 overflow-hidden border border-base-300"><div style={{ width: `${averagePhaseProgress}%` }} className="bg-success h-4" /></div>
        </div>
      </div>

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Expense Records</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Showing sample data (no backend)</div>
            <button className="btn btn-sm btn-primary" onClick={handleAddExpense}>Add Expense</button>
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
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.category}</td>
                  <td>{e.vendor}</td>
                  <td>${e.amount.toFixed(2)}</td>
                  <td>{e.note}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-xs" onClick={() => handleEditExpense(e)}>Edit</button>
                      <button className="btn btn-xs btn-error" onClick={() => handleDeleteExpense(e.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseModal show={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditingExpense(null); }} onSave={handleSaveExpense} expense={editingExpense || undefined} />
      )}
    </div>
  );
};

// Expense Modal component (local only)
const ExpenseModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseItem) => void;
  expense?: ExpenseItem;
}> = ({ show, onClose, onSave, expense }) => {
  const [form, setForm] = useState<ExpenseItem>(expense || { id: '', date: new Date().toISOString().split('T')[0], category: '', amount: 0, vendor: '', note: '' });

  useEffect(() => { if (expense) setForm(expense); }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.vendor) { alert('Please fill category and vendor'); return; }
    onSave({ ...form });
  };

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">{expense ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label"><span className="label-text">Date</span></label>
            <input type="date" className="input input-bordered w-full" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="label"><span className="label-text">Category</span></label>
            <input className="input input-bordered w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Vendor</span></label>
              <input className="input input-bordered w-full" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text">Amount</span></label>
              <input type="number" step="0.01" className="input input-bordered w-full" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label"><span className="label-text">Note</span></label>
            <input className="input input-bordered w-full" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskManagement;
