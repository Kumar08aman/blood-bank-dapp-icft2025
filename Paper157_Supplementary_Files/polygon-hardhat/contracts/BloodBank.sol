// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BloodBank {
    // State Variables
    address public admin;

    // Enums
    enum BloodType { A_Positive, A_Negative, B_Positive, B_Negative, AB_Positive, AB_Negative, O_Positive, O_Negative }
    enum UnitStatus { Pending_Test, Safe, In_Transit, Used, Expired }

    // Struct
    struct BloodUnit {
        uint unitId;
        string donorName;
        BloodType bloodType;
        uint donationDate;
        uint expiryDate;
        UnitStatus status;
        address currentOwner; // Blood bank or hospital
        address requestedBy;  // Hospital that requested the unit
    }
    
    // Events
    event UnitRequest(uint unitId, address indexed hospital);
    event UnitTransfer(uint unitId, address indexed from, address indexed to);

    // Storage
    BloodUnit[] public bloodUnits;
    mapping(address => bool) public isBloodBank;
    mapping(address => bool) public isHospital;

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    modifier onlyBloodBank() {
        require(isBloodBank[msg.sender], "Only an authorized blood bank can perform this action");
        _;
    }

    modifier onlyHospital() {
        require(isHospital[msg.sender], "Only an authorized hospital can perform this action");
        _;
    }

    // Constructor
    constructor() {
        admin = msg.sender;
    }

    // --- Administrative Functions ---
    function addBloodBank(address _bloodBankAddress) public onlyAdmin {
        require(!isBloodBank[_bloodBankAddress], "This address is already a blood bank");
        isBloodBank[_bloodBankAddress] = true;
    }

    function addHospital(address _hospitalAddress) public onlyAdmin {
        require(!isHospital[_hospitalAddress], "This address is already a hospital");
        isHospital[_hospitalAddress] = true;
    }

    // --- Blood Bank Functions ---
    function recordNewBloodUnit(string memory _donorName, BloodType _bloodType) public onlyBloodBank {
        uint donationTimestamp = block.timestamp;
        uint expiryTimestamp = donationTimestamp + 30 days;
        bloodUnits.push(BloodUnit({
            unitId: bloodUnits.length,
            donorName: _donorName,
            bloodType: _bloodType,
            donationDate: donationTimestamp,
            expiryDate: expiryTimestamp,
            status: UnitStatus.Safe, // Let's assume it's safe for now
            currentOwner: msg.sender,
            requestedBy: address(0) // No one has requested it yet
        }));
    }

    function approveTransfer(uint _unitId, address _hospitalAddress) public onlyBloodBank {
        BloodUnit storage unit = bloodUnits[_unitId];
        require(unit.currentOwner == msg.sender, "You do not own this unit");
        require(unit.requestedBy == _hospitalAddress, "This hospital did not request the unit");
        
        unit.currentOwner = _hospitalAddress;
        unit.status = UnitStatus.In_Transit;
        unit.requestedBy = address(0); // Clear the request
        emit UnitTransfer(_unitId, msg.sender, _hospitalAddress);
    }
    
    // --- Hospital Functions ---
    function requestUnit(uint _unitId) public onlyHospital {
        BloodUnit storage unit = bloodUnits[_unitId];
        require(unit.status == UnitStatus.Safe, "Unit is not available for request");
        
        unit.requestedBy = msg.sender;
        emit UnitRequest(_unitId, msg.sender);
    }

    // --- View Functions ---
    function getUnitCount() public view returns (uint) {
        return bloodUnits.length;
    }

    function getAvailableUnits() public view returns (BloodUnit[] memory) {
        uint availableCount = 0;
        for (uint i = 0; i < bloodUnits.length; i++) {
            if (bloodUnits[i].status == UnitStatus.Safe) {
                availableCount++;
            }
        }
        
        BloodUnit[] memory available = new BloodUnit[](availableCount);
        uint counter = 0;
        for (uint i = 0; i < bloodUnits.length; i++) {
            if (bloodUnits[i].status == UnitStatus.Safe) {
                available[counter] = bloodUnits[i];
                counter++;
            }
        }
        return available;
    }
}