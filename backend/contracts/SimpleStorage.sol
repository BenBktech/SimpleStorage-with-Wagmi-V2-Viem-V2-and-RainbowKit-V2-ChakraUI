// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract SimpleStorage {
    uint private storedNumber;

    event NumberChanged(uint oldValue, uint newValue);

    function store(uint _number) public {
        emit NumberChanged(storedNumber, _number);
        storedNumber = _number;
    }

    function retrieve() public view returns (uint) {
        return storedNumber;
    }
}