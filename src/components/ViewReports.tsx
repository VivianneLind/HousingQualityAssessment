import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';
import { formatTimestamp } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function ViewReports() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [assessmentId, setAssessmentId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [fetchAssessmentId, setFetchAssessmentId] = useState<number | undefined>(undefined);

  // Read contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isOwner = owner?.toLowerCase() === address?.toLowerCase();

  // Get quality report - only fetch when fetchAssessmentId is set
  const { data: qualityReport, isLoading: isLoadingReport, refetch: refetchReport } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getQualityReport',
    args: fetchAssessmentId ? [fetchAssessmentId] : undefined,
    query: {
      enabled: fetchAssessmentId !== undefined && fetchAssessmentId > 0,
    }
  });

  // Get property assessment count
  const { data: assessmentCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyAssessmentCount',
    args: propertyId ? [propertyId] : undefined,
  });

  // Get property assessment IDs
  const { data: assessmentIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyAssessmentIds',
    args: propertyId ? [propertyId] : undefined,
  });

  // Verify assessment
  const {
    data: verifyHash,
    writeContract: verify,
    isPending: isVerifyPending
  } = useWriteContract();

  const { isLoading: isVerifyLoading } = useWaitForTransactionReceipt({
    hash: verifyHash,
    onSuccess: () => {
      toast({
        title: "Verification Successful!",
        description: `Assessment #${verifyId} has been verified.`,
      });
      setVerifyId('');
      refetchReport();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    },
  });

  const handleVerify = async () => {
    if (!verifyId || Number(verifyId) < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Assessment ID",
        description: "Please enter a valid assessment ID",
      });
      return;
    }

    const assessmentId = parseInt(verifyId);

    verify({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'verifyAssessment',
      args: [assessmentId],
      // Note: Current contract (v1.0) calls Gateway which causes high gas
      // Deploy new contract (v2.0) to fix - see DEPLOYMENT_FIX.md
    });
  };

  const report = qualityReport as any;

  return (
    <Tabs defaultValue="report" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="report">Quality Report</TabsTrigger>
        <TabsTrigger value="property">Property History</TabsTrigger>
        {isOwner && <TabsTrigger value="verify">Verify</TabsTrigger>}
      </TabsList>

      <TabsContent value="report" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quality Report</CardTitle>
            <CardDescription>View quality assessment report by ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="reportId">Assessment ID</Label>
                <Input
                  id="reportId"
                  type="number"
                  placeholder="Enter assessment ID"
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!assessmentId || Number(assessmentId) < 1) {
                    toast({
                      variant: "destructive",
                      title: "Invalid Assessment ID",
                      description: "Please enter a valid assessment ID (must be greater than 0)",
                    });
                    return;
                  }
                  console.log('Fetching report for assessment ID:', assessmentId);
                  setFetchAssessmentId(Number(assessmentId));
                }}
                disabled={!assessmentId || Number(assessmentId) < 1 || isLoadingReport}
                isLoading={isLoadingReport}
                className="mt-auto"
              >
                Get Report
              </Button>
            </div>

            {fetchAssessmentId && !isLoadingReport && !report && (
              <div className="mt-6 p-6 border rounded-lg bg-yellow-500/10 border-yellow-500">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm font-medium">No Report Found</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This assessment has not been verified yet, or the report has not been generated.
                  Only verified assessments have quality reports.
                </p>
              </div>
            )}

            {report && (
              <div className="mt-6 p-6 border rounded-lg bg-accent/5">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                  <p className="text-6xl font-bold text-primary">
                    {report.publicOverallScore?.toString() || '0'}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className={`p-4 border rounded-lg ${report.hasStructuralIssues ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {report.hasStructuralIssues ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      <span className="font-medium">Structural Issues</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {report.hasStructuralIssues ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className={`p-4 border rounded-lg ${report.hasSafetyIssues ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {report.hasSafetyIssues ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      <span className="font-medium">Safety Issues</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {report.hasSafetyIssues ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className={`p-4 border rounded-lg ${report.hasUtilityIssues ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {report.hasUtilityIssues ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      <span className="font-medium">Utility Issues</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {report.hasUtilityIssues ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Report Generated: {formatTimestamp(Number(report.reportTime))}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="property" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Property Assessment History</CardTitle>
            <CardDescription>View all assessments for a specific property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="propertyId">Property ID</Label>
                <Input
                  id="propertyId"
                  placeholder="Enter property ID"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                />
              </div>
            </div>

            {assessmentCount !== undefined && (
              <div className="mt-6 space-y-4">
                <div className="p-6 border rounded-lg bg-accent/5">
                  <p className="text-sm text-muted-foreground mb-2">Total Assessments</p>
                  <p className="text-4xl font-bold text-primary">
                    {assessmentCount.toString()}
                  </p>
                </div>

                {assessmentIds && (assessmentIds as any[]).length > 0 && (
                  <div className="p-6 border rounded-lg">
                    <p className="text-sm font-medium mb-4">Assessment IDs:</p>
                    <div className="flex flex-wrap gap-2">
                      {(assessmentIds as any[]).map((id: any) => (
                        <span
                          key={id.toString()}
                          className="px-3 py-1 bg-primary/10 border border-primary rounded-full text-sm font-medium"
                        >
                          #{id.toString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {isOwner && (
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Assessment (Owner Only)</CardTitle>
              <CardDescription>
                Verify submitted assessments to generate quality reports.
                Once verified, the decryption process will begin and a report will be generated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verifyId">Assessment ID</Label>
                <Input
                  id="verifyId"
                  type="number"
                  placeholder="Enter assessment ID to verify"
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={isVerifyPending || isVerifyLoading}
                isLoading={isVerifyPending || isVerifyLoading}
              >
                Verify Assessment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
