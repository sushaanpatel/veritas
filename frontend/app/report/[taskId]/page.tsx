'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { ReportViewer } from '@/components/research/ReportViewer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useResearch } from '@/hooks/useResearch';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const { getReport, isLoading } = useResearch();
  
  const [reportData, setReportData] = useState<{ report: string; metadata: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      console.log('[ReportPage] Fetching report for task:', taskId);
      try {
        const data = await getReport(taskId);
        if (data) {
          console.log('[ReportPage] Report loaded successfully');
          setReportData({
            report: data.report,
            metadata: data.metadata,
          });
        } else {
          setError('Report not found');
        }
      } catch (err) {
        console.error('[ReportPage] Error loading report:', err);
        setError('Failed to load report');
      }
    };

    if (taskId) {
      fetchReport();
    }
  }, [taskId, getReport]);

  const handleNewResearch = () => {
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }}>
      <Header onNewResearch={handleNewResearch} />

      <Container>
        <div style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
              <LoadingSpinner size="lg" />
              <p className="text-body-lg text-muted mt-lg">Loading report...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <ErrorBanner
                message="Failed to load report"
                detail={error}
                onDismiss={() => setError(null)}
              />
              <div className="flex justify-center mt-xl">
                <button onClick={handleNewResearch} className="btn-primary btn-lg">
                  Start New Research
                </button>
              </div>
            </div>
          )}

          {/* Report Display */}
          {reportData && !isLoading && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <ReportViewer
                report={reportData.report}
                metadata={reportData.metadata}
              />

              <div className="flex justify-center" style={{ marginTop: 'var(--space-xxxl)' }}>
                <button onClick={handleNewResearch} className="btn-primary btn-lg">
                  Start New Research
                </button>
              </div>
            </div>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
}
