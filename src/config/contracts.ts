export const CONTRACT_ADDRESS = "0x43E296E1AE4071F5C2c802e67Cce7A42f2A1fFFc" as const;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AssessmentSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      }
    ],
    "name": "AssessmentVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "certifier",
        "type": "address"
      }
    ],
    "name": "AssessorCertified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AssessorRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "registerAssessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      }
    ],
    "name": "certifyAssessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_structuralScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_safetyScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_utilityScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_locationScore",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "_encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "submitQualityAssessment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "verifyAssessment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "getAssessmentInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "getQualityReport",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "publicOverallScore",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "hasStructuralIssues",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasSafetyIssues",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasUtilityIssues",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "reportTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      }
    ],
    "name": "getAssessorStats",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCertified",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "totalAssessments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "verifiedAssessments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "registrationTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "getPropertyAssessmentCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "getPropertyAssessmentIds",
    "outputs": [
      {
        "internalType": "uint32[]",
        "name": "",
        "type": "uint32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalAssessments",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
