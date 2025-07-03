import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Deal, FileInfo } from "../services/deals";
import { getDeals, getDealFiles } from "../services/deals";
import { logout } from "../services/auth";
import DealCard from "../components/DealCard";

export default function HomePage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealFiles, setDealFiles] = useState<FileInfo[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    // if there is no token, redirect to login
    if (!token) {
      navigate("/");
      return;
    }

    // fetch deals from API on component mount
    fetchInitialDeals();
  }, [token, navigate]);

  const fetchInitialDeals = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await getDeals();
      
      if (result.deals) {
        setDeals(result.deals);
        // cache deals in localStorage for offline access
        localStorage.setItem("deals", JSON.stringify(result.deals));
      }
    } catch (error) {
      console.error("Error loading initial deals:", error);
      // if API fails, try to load from localStorage as fallback
      const savedDeals = localStorage.getItem("deals");
      if (savedDeals) {
        try {
          const parsedDeals = JSON.parse(savedDeals);
          setDeals(parsedDeals);
          console.log("Loaded deals from localStorage as fallback");
        } catch (parseError) {
          console.error("Error parsing saved deals:", parseError);
          setDeals([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshDeals = async () => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      const result = await getDeals();
      
      if (result.deals) {
        setDeals(result.deals);
        // Update localStorage with fresh data
        localStorage.setItem("deals", JSON.stringify(result.deals));
      }
    } catch (error) {
      console.error("Error refreshing deals:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewDetails = async (deal: Deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
    setFilesLoading(true);
    setDealFiles([]);

    try {
      const result = await getDealFiles(deal.id);
      
      if (result.error) {
        console.error("Error fetching files:", result.error);
      } else {
        setDealFiles(result.files);
      }
    } catch (error) {
      console.error("Error fetching deal files:", error);
    } finally {
      setFilesLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--cream)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--blue-dark)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--blue-dark)]">Loading your deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--cream)]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div className="flex items-center gap-4">
              <img 
                src="/altius_logo.png" 
                alt="Altius Capital Logo" 
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[color:var(--blue-dark)]">
                Altius Capital Dashboard
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefreshDeals}
                disabled={refreshing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Refreshing...
                  </>
                ) : (
                  "Refresh Deals"
                )}
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary w-full sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* deals section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[color:var(--blue-dark)]">
              Your Available Deals
            </h2>
            <span className="bg-[color:var(--blue-dark)] text-white px-4 py-2 rounded-full text-sm font-medium">
              {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'}
            </span>
          </div>

          {deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-8xl mb-6">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No deals available</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Check back later for new investment opportunities or contact your account manager for more information.
              </p>
              <button
                onClick={handleRefreshDeals}
                disabled={refreshing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? "Refreshing..." : "Try Refresh"}
              </button>
            </div>
          )}
        </div>

        {/* Authentication Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[color:var(--blue-dark)] mb-4">
            Session Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-green-600 font-medium">✓ Authenticated</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <span className="ml-2 text-gray-600 uppercase">
                  {localStorage.getItem("selectedWebsite") || "fo1"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <span className="font-medium text-gray-700">Token:</span>
              <div className="mt-1 font-mono text-xs text-gray-600 bg-white p-2 rounded border break-all">
                {token}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* deal details modal */}
      {showModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-[color:var(--blue-dark)]">
                {selectedDeal.title || "Deal Details"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Deal Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">ID:</span>
                      <span className="font-mono">{selectedDeal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="font-medium">{selectedDeal.deal_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Asset Class:</span>
                      <span>{selectedDeal.asset_class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Currency:</span>
                      <span className="font-mono">{selectedDeal.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Firm:</span>
                      <span>{selectedDeal.firm || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Created:</span>
                      <span>{formatDate(selectedDeal.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Available Files</h4>
                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--blue-dark)] mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-600">Loading files...</p>
                  </div>
                ) : dealFiles.length > 0 ? (
                  <div className="space-y-3">
                    {dealFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{file.name}</div>
                          <div className="text-sm text-gray-600">
                            {file.type} • {formatFileSize(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(file.download_url, '_blank')}
                          className="btn-primary text-sm py-2 px-4 ml-4"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-4xl mb-3">📁</div>
                    <p className="text-gray-600">No files available for this deal.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
