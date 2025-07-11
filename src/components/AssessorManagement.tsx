import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function AssessorManagement() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [certifyAddress, setCertifyAddress] = useState('');

  // Get stats for the address being certified
  const { data: targetStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAssessorStats',
    args: certifyAddress && certifyAddress.length === 42 ? [certifyAddress as `0x${string}`] : undefined,
  });

  // Read contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isOwner = owner?.toLowerCase() === address?.toLowerCase();

  // Read assessor stats
  const { data: assessorStats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAssessorStats',
    args: address ? [address] : undefined,
  });

  // Register assessor
  const {
    data: registerHash,
    writeContract: register,
    isPending: isRegisterPending
  } = useWriteContract();

  const { isLoading: isRegisterLoading } = useWaitForTransactionReceipt({
    hash: registerHash,
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Please wait for the contract owner to certify you.",
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    },
  });

  // Certify assessor
  const {
    data: certifyHash,
    writeContract: certify,
    isPending: isCertifyPending
  } = useWriteContract();

  const { isLoading: isCertifyLoading } = useWaitForTransactionReceipt({
    hash: certifyHash,
    onSuccess: () => {
      toast({
        title: "Certification Successful!",
        description: `Assessor ${certifyAddress} has been certified.`,
      });
      setCertifyAddress('');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Certification Failed",
        description: error.message,
      });
    },
  });

  const handleRegister = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return;
    }

    // Parse stats - contract returns array [isRegistered, isCertified, totalAssessments, verifiedAssessments, registrationTime]
    const statsArray = assessorStats as any;
    const currentStats = statsArray ? {
      isRegistered: statsArray[0],
      isCertified: statsArray[1],
      totalAssessments: statsArray[2],
      verifiedAssessments: statsArray[3],
      registrationTime: statsArray[4],
    } : null;

    console.log('Registering assessor...');
    console.log('Wallet address:', address);
    console.log('Contract address:', CONTRACT_ADDRESS);
    console.log('Already registered:', currentStats?.isRegistered);

    if (currentStats?.isRegistered) {
      toast({
        variant: "destructive",
        title: "Already Registered",
        description: "You are already registered as an assessor",
      });
      return;
    }

    try {
      register({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerAssessor',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleCertify = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
      });
      return;
    }

    if (!certifyAddress || !certifyAddress.startsWith('0x') || certifyAddress.length !== 42) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address (0x...)",
      });
      return;
    }

    // Check if caller is owner
    if (owner && address.toLowerCase() !== owner.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only the contract owner can certify assessors",
      });
      return;
    }

    // Parse target stats
    const targetStatsArray = targetStats as any;
    const parsedTargetStats = targetStatsArray ? {
      isRegistered: targetStatsArray[0],
      isCertified: targetStatsArray[1],
    } : null;

    console.log('Certifying assessor:', certifyAddress);
    console.log('Target stats:', parsedTargetStats);
    console.log('Caller address:', address);
    console.log('Owner address:', owner);

    // Check if target is registered
    if (parsedTargetStats && !parsedTargetStats.isRegistered) {
      toast({
        variant: "destructive",
        title: "Not Registered",
        description: "This address must register as an assessor first",
      });
      return;
    }

    // Check if already certified
    if (parsedTargetStats && parsedTargetStats.isCertified) {
      toast({
        variant: "destructive",
        title: "Already Certified",
        description: "This assessor is already certified",
      });
      return;
    }

    certify({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'certifyAssessor',
      args: [certifyAddress as `0x${string}`],
    });
  };

  // Parse stats - contract returns array [isRegistered, isCertified, totalAssessments, verifiedAssessments, registrationTime]
  const statsArray = assessorStats as any;
  const stats = statsArray ? {
    isRegistered: statsArray[0],
    isCertified: statsArray[1],
    totalAssessments: statsArray[2],
    verifiedAssessments: statsArray[3],
    registrationTime: statsArray[4],
  } : null;

  console.log('AssessorManagement - Raw stats:', statsArray);
  console.log('AssessorManagement - Parsed stats:', stats);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessor Registration</CardTitle>
          <CardDescription>
            Register as an assessor to submit quality assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRegister}
            disabled={isRegisterPending || isRegisterLoading || stats?.isRegistered}
            isLoading={isRegisterPending || isRegisterLoading}
          >
            {stats?.isRegistered ? 'Already Registered' : 'Register as Assessor'}
          </Button>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {stats.isRegistered ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Registered</span>
                </div>
                <p className="text-2xl font-bold">
                  {stats.isRegistered ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {stats.isCertified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Certified</span>
                </div>
                <p className="text-2xl font-bold">
                  {stats.isCertified ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">Total Assessments</p>
                <p className="text-2xl font-bold">{stats.totalAssessments?.toString() || '0'}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">Verified</p>
                <p className="text-2xl font-bold">{stats.verifiedAssessments?.toString() || '0'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Certify Assessor (Owner Only)</CardTitle>
            <CardDescription>
              Certify registered assessors to allow them to submit assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certifyAddress">Assessor Address</Label>
              <Input
                id="certifyAddress"
                placeholder="0x..."
                value={certifyAddress}
                onChange={(e) => setCertifyAddress(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCertify}
              disabled={isCertifyPending || isCertifyLoading}
              isLoading={isCertifyPending || isCertifyLoading}
            >
              Certify Assessor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
