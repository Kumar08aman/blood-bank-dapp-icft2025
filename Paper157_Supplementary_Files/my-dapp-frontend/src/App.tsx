import { useState, useEffect } from 'react';
import './App.css';
import { ethers } from "ethers";
import { bloodBankAddress, bloodBankABI } from './contractInfo';

// A specific type for the MetaMask provider that includes event listeners
interface MetaMaskInpageProvider {
  isMetaMask?: boolean;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
}

// Update the global window interface
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

// Define the structure of a BloodUnit for TypeScript
interface BloodUnit {
  unitId: bigint;
  donorName: string;
  bloodType: number;
  currentOwner: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function App() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBank, setIsBank] = useState<boolean>(false);
  const [isHospital, setIsHospital] = useState<boolean>(false);

  const [newBloodBankAddress, setNewBloodBankAddress] = useState<string>("");
  const [newHospitalAddress, setNewHospitalAddress] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [bloodType, setBloodType] = useState<number>(0);
  const [availableUnits, setAvailableUnits] = useState<BloodUnit[]>([]);

  const checkUserRoles = async (account: string) => {
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(bloodBankAddress, bloodBankABI, provider);

      const adminAddress = await contract.admin();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());

      const isUserABank = await contract.isBloodBank(account);
      setIsBank(isUserABank);

      const isUserAHospital = await contract.isHospital(account);
      setIsHospital(isUserAHospital);

    } catch (error) {
      console.error("Error checking roles:", error);
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: any[]) => {
      const account = accounts.length > 0 ? (accounts[0] as string) : null;
      setCurrentAccount(account);
      if (account) {
        checkUserRoles(account);
      } else {
        setIsAdmin(false);
        setIsBank(false);
        setIsHospital(false);
      }
    };

    if (window.ethereum) {
      (async () => {
        const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
        handleAccountsChanged(accounts);
      })();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask!");
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        checkUserRoles(account);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
    }
  };

  const handleAddRole = async (address: string, role: 'bank' | 'hospital') => {
    if (!address || !ethers.isAddress(address)) return alert("Invalid address");
    try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(bloodBankAddress, bloodBankABI, signer);

        let tx;
        if (role === 'bank') {
            tx = await contract.addBloodBank(address);
        } else {
            tx = await contract.addHospital(address);
        }

        await tx.wait();
        alert(`Successfully added new ${role}`);
        if (role === 'bank') setNewBloodBankAddress("");
        if (role === 'hospital') setNewHospitalAddress("");
    } catch (error) {
        console.error(`Error adding ${role}:`, error);
    }
  };

  const handleRecordBloodUnit = async () => {
    if (!donorName) return alert("Please enter donor name");
    try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(bloodBankAddress, bloodBankABI, signer);
        const tx = await contract.recordNewBloodUnit(donorName, bloodType);
        await tx.wait();
        alert("Successfully recorded new blood unit!");
        setDonorName("");
    } catch (error) {
        console.error("Error recording blood unit:", error);
    }
  };

  const fetchAvailableUnits = async () => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const contract = new ethers.Contract(bloodBankAddress, bloodBankABI, provider);
        const units = await contract.getAvailableUnits();
        const formattedUnits = units.map((unit: any) => ({
            unitId: unit.unitId,
            donorName: unit.donorName,
            bloodType: Number(unit.bloodType),
            currentOwner: unit.currentOwner
        }));
        setAvailableUnits(formattedUnits);
    } catch (error) {
        console.error("Error fetching available units:", error);
    }
  };

  const renderAdminPanel = () => {
    if (isAdmin) {
      return (
        <div className="panel">
          <h2>Admin Panel</h2>
          <div>
            <input type="text" placeholder="Enter new blood bank address" value={newBloodBankAddress} onChange={(e) => setNewBloodBankAddress(e.target.value)} />
            <button onClick={() => handleAddRole(newBloodBankAddress, 'bank')}>Add Blood Bank</button>
          </div>
          <div style={{marginTop: '1rem'}}>
            <input type="text" placeholder="Enter new hospital address" value={newHospitalAddress} onChange={(e) => setNewHospitalAddress(e.target.value)} />
            <button onClick={() => handleAddRole(newHospitalAddress, 'hospital')}>Add Hospital</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderBloodBankPanel = () => {
    if (isBank) {
      return (
          <div className="panel">
              <h2>Blood Bank Panel</h2>
              <input type="text" placeholder="Donor Name" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
              <select value={bloodType} onChange={(e) => setBloodType(Number(e.target.value))}>
                  {BLOOD_TYPES.map((type, index) => <option key={index} value={index}>{type}</option>)}
              </select>
              <button onClick={handleRecordBloodUnit}>Record New Unit</button>
          </div>
      );
    }
    return null;
  }

  const renderHospitalPanel = () => {
    if (isHospital) {
        return (
            <div className="panel">
                <h2>Hospital Panel</h2>
                <button onClick={fetchAvailableUnits}>Fetch Available Blood Units</button>
                {availableUnits.length > 0 && (
                    <div style={{marginTop: '1rem'}}>
                        <h3>Available Units</h3>
                        {availableUnits.map((unit) => (
                            <div key={Number(unit.unitId)} style={{border: '1px solid #555', padding: '0.5rem', margin: '0.5rem', borderRadius: '8px'}}>
                               <p>Unit ID: {Number(unit.unitId)}</p>
                               <p>Blood Type: {BLOOD_TYPES[unit.bloodType]}</p>
                               <p>Donor: {unit.donorName}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return null;
  }

  return (
    <div className="App">
      <h1>Blood Bank DApp</h1>
      {currentAccount ? (
        <div>
          <p>Connected Account: {currentAccount}</p>
          {renderAdminPanel()}
          {renderBloodBankPanel()}
          {renderHospitalPanel()}
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;