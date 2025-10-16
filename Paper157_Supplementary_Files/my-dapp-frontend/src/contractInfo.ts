export const bloodBankAddress = "0xc4d09fB11087784Fc401D62e658BA9dBfc3F3035";

export const bloodBankABI = [
  // Existing functions from before
  { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_bloodBankAddress", "type": "address" }], "name": "addBloodBank", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isBloodBank", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "_donorName", "type": "string" }, { "internalType": "uint8", "name": "_bloodType", "type": "uint8" }], "name": "recordNewBloodUnit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  
  // --- NEW FUNCTIONS FOR HOSPITAL PANEL ---
  { "inputs": [{ "internalType": "address", "name": "_hospitalAddress", "type": "address" }], "name": "addHospital", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isHospital", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  {
    "inputs": [],
    "name": "getAvailableUnits",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "unitId", "type": "uint256" },
          { "internalType": "string", "name": "donorName", "type": "string" },
          { "internalType": "enum BloodBank.BloodType", "name": "bloodType", "type": "uint8" },
          { "internalType": "uint256", "name": "donationDate", "type": "uint256" },
          { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
          { "internalType": "enum BloodBank.UnitStatus", "name": "status", "type": "uint8" },
          { "internalType": "address", "name": "currentOwner", "type": "address" },
          { "internalType": "address", "name": "requestedBy", "type": "address" }
        ],
        "internalType": "struct BloodBank.BloodUnit[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];