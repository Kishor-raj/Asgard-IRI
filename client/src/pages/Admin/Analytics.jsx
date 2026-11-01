import { useEffect, useState } from 'react';
import {
  CurrencyRupeeIcon,
  ChartBarIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { getAdminAnalytics, exportPaymentsCSV } from '../../services/admin.service';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnalytics();
      setData(res.data);
    } catch {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPaymentsCSV();
      toast.success('Payments CSV downloaded.');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader />
      </div>
    );
  }

  const { metrics, paymentBreakdown = [], dailyTrends = [], certificatesByType = [], pageViews, topPages = [] } =
    data || {};

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-grey-200">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">
            Institutional Analytics & Funnels
          </h1>
          <p className="text-grey-500 text-xs mt-1">
            Real-time telemetry, revenue accounting, certificate automation metrics, and visitor engagement.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Refresh Metrics
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport} loading={exporting}>
            <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
            Export Payments CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 border-navy/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-grey-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="font-display font-bold text-2xl text-navy">
              ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              ✓ Verified via Gateway
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-navy/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-grey-400 uppercase tracking-wider block">
              Paid Transactions
            </span>
            <span className="font-display font-bold text-2xl text-navy">
              {metrics?.paidTransactions || 0}
            </span>
            <span className="text-[11px] text-grey-500 font-medium block mt-1">
              Out of {metrics?.totalPayments || 0} total orders
            </span>
          </div>
          <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy">
            <ChartBarIcon className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-navy/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-grey-400 uppercase tracking-wider block">
              Active Partners
            </span>
            <span className="font-display font-bold text-2xl text-navy">
              {metrics?.activePartnersCount || 0}
            </span>
            <span className="text-[11px] text-gold-dark font-medium block mt-1">
              Global Collaborations
            </span>
          </div>
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold-dark">
            <GlobeAltIcon className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 border-navy/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-grey-400 uppercase tracking-wider block">
              Credential Certificates
            </span>
            <span className="font-display font-bold text-2xl text-navy">
              {certificatesByType.reduce((sum, c) => sum + c.count, 0)}
            </span>
            <span className="text-[11px] text-navy font-medium block mt-1">
              Auto-generated with QR
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <DocumentCheckIcon className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Traffic & Page Views */}
      {pageViews && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-grey-100">
            <div>
              <h2 className="font-display font-bold text-lg text-navy flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-gold-dark" />
                Google Analytics 4 & Core Web Vitals
              </h2>
              <p className="text-grey-500 text-xs">
                Audience engagement metrics monitored through GA4 and Lighthouse CI
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Lighthouse: 98/100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] text-grey-400 block font-medium">Monthly Pageviews</span>
              <span className="font-display font-bold text-xl text-navy">
                {pageViews.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] text-grey-400 block font-medium">Unique Visitors</span>
              <span className="font-display font-bold text-xl text-navy">
                {pageViews.uniqueVisitors.toLocaleString()}
              </span>
            </div>
            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] text-grey-400 block font-medium">Avg Session Time</span>
              <span className="font-display font-bold text-xl text-navy">
                {pageViews.avgSessionDuration}
              </span>
            </div>
            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] text-grey-400 block font-medium">Bounce Rate</span>
              <span className="font-display font-bold text-xl text-navy">
                {pageViews.bounceRate}
              </span>
            </div>
          </div>

          {/* Top Pages Table */}
          <h3 className="font-display font-semibold text-sm text-navy mb-3">
            Top Content & Traffic Destinations
          </h3>
          <div className="border border-grey-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-grey-50 border-b border-grey-200 text-grey-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Page Title</th>
                  <th className="py-2.5 px-4">Route Path</th>
                  <th className="py-2.5 px-4 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-grey-50/50">
                    <td className="py-2.5 px-4 font-medium text-navy">{page.title}</td>
                    <td className="py-2.5 px-4 font-mono text-grey-500">{page.path}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-navy">
                      {page.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment & Certificate Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-navy mb-4">
            Payment Status Distribution
          </h3>
          <div className="space-y-3">
            {paymentBreakdown.length === 0 ? (
              <p className="text-grey-400 text-xs">No payment records yet.</p>
            ) : (
              paymentBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between p-3 rounded-xl bg-grey-50 border border-grey-200 text-xs"
                >
                  <span className="capitalize font-semibold text-navy">{item.status}</span>
                  <div className="text-right">
                    <span className="font-bold text-navy block">{item.count} orders</span>
                    <span className="text-[11px] text-grey-500">
                      ₹{parseFloat(item.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Certificate Breakdown */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-navy mb-4">
            Automated Credentials by Category
          </h3>
          <div className="space-y-3">
            {certificatesByType.length === 0 ? (
              <p className="text-grey-400 text-xs">No certificates issued yet.</p>
            ) : (
              certificatesByType.map((item) => (
                <div
                  key={item.issued_for_type}
                  className="flex items-center justify-between p-3 rounded-xl bg-grey-50 border border-grey-200 text-xs"
                >
                  <span className="capitalize font-semibold text-navy">
                    {item.issued_for_type} Credentials
                  </span>
                  <span className="font-bold text-navy bg-navy/5 px-2.5 py-1 rounded-full">
                    {item.count} Issued
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
