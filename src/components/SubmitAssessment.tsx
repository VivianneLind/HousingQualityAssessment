import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';
import { AlertTriangle } from 'lucide-react';

export function SubmitAssessment() {
  const { address } = useAccount();
  const { toast } = useToast();

  // Check if user is certified
  const { data: assessorStats, isLoading: isLoadingStats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAssessorStats',
    args: address ? [address] : undefined,
  });

  // Parse stats - contract returns array [isRegistered, isCertified, totalAssessments, verifiedAssessments, registrationTime]
  const statsArray = assessorStats as any;
  const stats = statsArray ? {
    isRegistered: statsArray[0],
    isCertified: statsArray[1],
    totalAssessments: statsArray[2],
    verifiedAssessments: statsArray[3],
    registrationTime: statsArray[4],
  } : null;

  const isCertified = stats?.isCertified === true;
  const isRegistered = stats?.isRegistered === true;

  // Debug: Log certification status
  console.log('SubmitAssessment - Address:', address);
  console.log('SubmitAssessment - Raw Stats:', statsArray);
  console.log('SubmitAssessment - Parsed Stats:', stats);
  console.log('SubmitAssessment - isRegistered:', isRegistered);
  console.log('SubmitAssessment - isCertified:', isCertified);
  const [propertyId, setPropertyId] = useState('');
  const [structuralScore, setStructuralScore] = useState(85);
  const [safetyScore, setSafetyScore] = useState(90);
  const [utilityScore, setUtilityScore] = useState(75);
  const [locationScore, setLocationScore] = useState(80);

  const {
    data: hash,
    writeContract,
    isPending
  } = useWriteContract();

  const { isLoading } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      toast({
        title: "Assessment Submitted!",
        description: "Your quality assessment has been recorded on the blockchain.",
      });
      // Reset form
      setPropertyId('');
      setStructuralScore(85);
      setSafetyScore(90);
      setUtilityScore(75);
      setLocationScore(80);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return;
    }

    if (!isCertified) {
      toast({
        variant: "destructive",
        title: "Not Certified",
        description: "You must be a certified assessor to submit assessments. Please ask the contract owner to certify your address.",
      });
      return;
    }

    if (!propertyId.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Property ID",
        description: "Please enter a property identifier",
      });
      return;
    }

    if (structuralScore < 0 || structuralScore > 100 ||
        safetyScore < 0 || safetyScore > 100 ||
        utilityScore < 0 || utilityScore > 100 ||
        locationScore < 0 || locationScore > 100) {
      toast({
        variant: "destructive",
        title: "Invalid Scores",
        description: "All scores must be between 0 and 100",
      });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitQualityAssessment',
      args: [
        structuralScore,
        safetyScore,
        utilityScore,
        locationScore,
        propertyId
      ],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Quality Assessment</CardTitle>
        <CardDescription>
          Submit a privacy-preserving quality assessment for a property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {address && !isCertified && (
          <div className="p-4 border border-warning/50 bg-warning/10 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-warning">Certification Required</p>
                <p className="text-xs text-muted-foreground">
                  {!isRegistered
                    ? "You must register as an assessor first, then ask the contract owner to certify your address."
                    : "You are registered but not certified yet. Please ask the contract owner to certify your address."}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchStats()}
                    disabled={isLoadingStats}
                  >
                    {isLoadingStats ? 'Checking...' : 'Refresh Status'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="propertyId">Property Identifier</Label>
          <Input
            id="propertyId"
            placeholder="e.g., PROP-2024-001"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="structural">Structural Score (0-100)</Label>
            <Input
              id="structural"
              type="number"
              min="0"
              max="100"
              value={structuralScore}
              onChange={(e) => setStructuralScore(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Foundation, walls, roof integrity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety">Safety Score (0-100)</Label>
            <Input
              id="safety"
              type="number"
              min="0"
              max="100"
              value={safetyScore}
              onChange={(e) => setSafetyScore(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Fire safety, electrical, emergency exits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="utility">Utility Score (0-100)</Label>
            <Input
              id="utility"
              type="number"
              min="0"
              max="100"
              value={utilityScore}
              onChange={(e) => setUtilityScore(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Plumbing, heating, electrical systems
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Score (0-100)</Label>
            <Input
              id="location"
              type="number"
              min="0"
              max="100"
              value={locationScore}
              onChange={(e) => setLocationScore(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Neighborhood, access, environment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <div className="flex-1">
            <p className="text-sm font-medium">Overall Average Score</p>
            <p className="text-3xl font-bold text-primary">
              {Math.round((structuralScore + safetyScore + utilityScore + locationScore) / 4)}
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isPending || isLoading || !isCertified}
            isLoading={isPending || isLoading}
            size="lg"
          >
            {isCertified ? 'Submit Assessment' : 'Certification Required'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
