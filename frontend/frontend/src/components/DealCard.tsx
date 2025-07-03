import type { Deal } from "../services/deals";

interface DealCardProps {
  deal: Deal;
  onViewDetails: (deal: Deal) => void;
}

export default function DealCard({ deal, onViewDetails }: DealCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 hover:bg-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--blue-dark)] truncate pr-3">
          {deal.title || "Unnamed Deal"}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(deal.deal_status)}`}>
          {deal.deal_status}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Asset Class:</span>
          <span className="text-right">{deal.asset_class || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Currency:</span>
          <span className="text-right font-mono">{deal.currency || 'N/A'}</span>
        </div>
        
        {deal.firm && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Firm:</span>
            <span className="text-right">{deal.firm}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Created:</span>
          <span className="text-right">{formatDate(deal.created_at)}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-mono">ID: {deal.id}</span>
          <button 
            className="btn-primary text-sm py-2 px-4 hover:bg-[color:var(--blue-dark)] transition-colors"
            onClick={() => onViewDetails(deal)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
} 