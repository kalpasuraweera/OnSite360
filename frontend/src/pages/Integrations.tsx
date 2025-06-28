import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSync } from 'react-icons/fa';

interface Integration {
    id: string;
    name: string;
    type: 'openai' | 'openweather' | 'other';
    apiKey: string;
    isActive: boolean;
    lastSynced?: Date;
}

const Integrations: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
    const [formData, setFormData] = useState<Partial<Integration>>({
        name: '',
        type: 'openai',
        apiKey: '',
        isActive: true
    });

    // Mock fetch integrations - replace with actual API call
    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                // Replace with actual API call
                const mockData: Integration[] = [
                    {
                        id: '1',
                        name: 'OpenAI GPT-4',
                        type: 'openai',
                        apiKey: '••••••••••••••••',
                        isActive: true,
                        lastSynced: new Date('2023-01-01')
                    },
                    {
                        id: '2',
                        name: 'Weather API',
                        type: 'openweather',
                        apiKey: '••••••••••••••••',
                        isActive: false,
                        lastSynced: new Date('2023-02-15')
                    }
                ];
                
                setTimeout(() => {
                    setIntegrations(mockData);
                    setIsLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching integrations:', error);
                setIsLoading(false);
            }
        };

        fetchIntegrations();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleAddIntegration = () => {
        setFormData({
            name: '',
            type: 'openai',
            apiKey: '',
            isActive: true
        });
        setIsAddModalOpen(true);
    };

    const handleEditIntegration = (integration: Integration) => {
        setCurrentIntegration(integration);
        setFormData({
            name: integration.name,
            type: integration.type,
            apiKey: integration.apiKey,
            isActive: integration.isActive
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteIntegration = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this integration?')) {
            try {
                // Replace with actual API call
                setIntegrations(integrations.filter(integration => integration.id !== id));
            } catch (error) {
                console.error('Error deleting integration:', error);
            }
        }
    };

    const handleSyncIntegration = async (id: string) => {
        try {
            // Replace with actual API call
            setIntegrations(integrations.map(integration => 
                integration.id === id 
                    ? { ...integration, lastSynced: new Date() }
                    : integration
            ));
        } catch (error) {
            console.error('Error syncing integration:', error);
        }
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Replace with actual API call
            const newIntegration: Integration = {
                id: Date.now().toString(),
                name: formData.name || '',
                type: (formData.type as 'openai' | 'openweather' | 'other') || 'other',
                apiKey: formData.apiKey || '',
                isActive: formData.isActive || false,
                lastSynced: new Date()
            };
            
            setIntegrations([...integrations, newIntegration]);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding integration:', error);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentIntegration) return;
        
        try {
            // Replace with actual API call
            setIntegrations(integrations.map(integration =>
                integration.id === currentIntegration.id
                    ? { 
                            ...integration, 
                            name: formData.name || integration.name,
                            type: (formData.type as 'openai' | 'openweather' | 'other') || integration.type,
                            apiKey: formData.apiKey || integration.apiKey,
                            isActive: formData.isActive ?? integration.isActive
                        }
                    : integration
            ));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating integration:', error);
        }
    };

    const getIntegrationTypeLabel = (type: string) => {
        switch(type) {
            case 'openai': return 'OpenAI';
            case 'openweather': return 'OpenWeather';
            default: return 'Other';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">External API Integrations</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleAddIntegration}
                >
                    <FaPlus className="mr-2" /> Add Integration
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>API Key</th>
                                <th>Status</th>
                                <th>Last Synced</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {integrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">
                                        No integrations found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                integrations.map((integration) => (
                                    <tr key={integration.id}>
                                        <td>{integration.name}</td>
                                        <td>{getIntegrationTypeLabel(integration.type)}</td>
                                        <td>{integration.apiKey}</td>
                                        <td>
                                            <div className={`badge ${integration.isActive ? 'badge-success' : 'badge-error'}`}>
                                                {integration.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td>
                                            {integration.lastSynced 
                                                ? new Date(integration.lastSynced).toLocaleDateString() 
                                                : 'Never'}
                                        </td>
                                        <td className="flex space-x-2">
                                            <button
                                                className="btn btn-sm btn-circle btn-ghost text-blue-500"
                                                onClick={() => handleEditIntegration(integration)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-circle btn-ghost text-red-500"
                                                onClick={() => handleDeleteIntegration(integration.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-circle btn-ghost text-green-500"
                                                onClick={() => handleSyncIntegration(integration.id)}
                                            >
                                                <FaSync />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Integration Modal */}
            {isAddModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Add New Integration</h3>
                        <form onSubmit={handleSubmitAdd}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Integration Name</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter integration name"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Integration Type</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full"
                                    required
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="openweather">OpenWeather</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">API Key</span>
                                </label>
                                <input
                                    type="text"
                                    name="apiKey"
                                    value={formData.apiKey}
                                    onChange={handleInputChange}
                                    placeholder="Enter API key"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Active</span>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="toggle toggle-primary"
                                    />
                                </label>
                            </div>
                            
                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Add Integration
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Integration Modal */}
            {isEditModalOpen && currentIntegration && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Edit Integration</h3>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Integration Name</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter integration name"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Integration Type</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full"
                                    required
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="openweather">OpenWeather</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">API Key</span>
                                </label>
                                <input
                                    type="text"
                                    name="apiKey"
                                    value={formData.apiKey}
                                    onChange={handleInputChange}
                                    placeholder="Enter API key"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                            
                            <div className="form-control mb-4">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Active</span>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="toggle toggle-primary"
                                    />
                                </label>
                            </div>
                            
                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Update Integration
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;