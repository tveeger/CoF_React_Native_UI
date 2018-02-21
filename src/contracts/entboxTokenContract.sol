pragma solidity ^0.4.16;

contract Owned { address public owner;

	function Owned() public {
		owner = msg.sender;
	}

	modifier onlyOwner {
		require (msg.sender == owner);
		_;
	}

	function transferOwnership(address newOwner) public onlyOwner {
		owner = newOwner;
	}
}

contract StandardToken { 
	mapping( address => uint ) _balances;
	uint public _supply;
	uint256 public totalSupply;

	event Transfer(address indexed from, address indexed to, uint value);

	function totalSupply() public constant returns (uint supply) {
		return _supply;
	}

	function balanceOf( address who ) public constant returns (uint value) {
		return _balances[who];
	}

	function transfer( address to, uint value) public returns (bool success) {
		require(to != 0x0);
		require( _balances[msg.sender] > value && _balances[to] + value > _balances[to]);
		require( safeToAdd(_balances[to], value) );
		_balances[msg.sender] -= value;
		_balances[to] += value;
		Transfer( msg.sender, to, value );
		return true;
	}

	function safeToAdd(uint a, uint b) internal pure returns (bool) {
		return (a + b >= a);
	}

}


contract EntboxContract is StandardToken, Owned {
	string public constant name = "Chains Of Freedom";
	string public constant symbol = "DET";
	uint public constant decimals = 0;
	string public constant version = "0.1";

	struct DetsReceipt {
		string id;
		address tokenCreator;
		uint detsAmount;
		uint euroAmount;
		bool tokenCreatedStatus;
	}

	struct DetsDestruction {
		string id;
		address destroyer;
		uint detsDestroyed;
		string iban;
	}

	mapping( string => DetsReceipt ) receipts;
	mapping( string => DetsDestruction ) destructions;
	mapping( address => uint ) balances;
	uint256 totalDets = 0;

	function EntboxContract() public {
		owner = msg.sender;
	}

	function getTotalDetsAmount() public view returns (uint256 detsAmount) {
		return totalDets;
	}

	function storeReceipt(string id, address tokenCreator, uint detsAmount, uint euroAmount) public onlyOwner {
		receipts[id] = DetsReceipt(id, tokenCreator, detsAmount, euroAmount,false);
	}
	function getDetsAmountFromReceipt(string id) public view returns (uint detsAmount) {
		return receipts[id].detsAmount;
	}
	function getEuroAmountFromReceipt(string id) public view returns (uint euroAmount) {
		return receipts[id].euroAmount;
	}
	function getTokenCreatorFromReceipt(string id) public view returns (address tokenCreator) {
		return receipts[id].tokenCreator;
	}
	function getTokenCreatedStatusFromReceipt(string id) public view returns (bool tokenCreatedStatus) {
		return receipts[id].tokenCreatedStatus;
	}

	function createDets(string id) public {
		require(!receipts[id].tokenCreatedStatus);
		require(getDetsAmountFromReceipt(id) > 0);
		receipts[id].tokenCreatedStatus = true;
		address addr = getTokenCreatorFromReceipt(id);
		uint detsToCreate = getDetsAmountFromReceipt(id);
		balances[addr] += detsToCreate;
		totalSupply += detsToCreate;
	}

	function getDetsBalance(address addr) public view returns (uint detsAmount) {
		return balances[addr];
	}

	function destroyDets(string id, uint detsToDestroy, string iban) public {
		require(balances[msg.sender] > detsToDestroy);
		require(getDetsDestroyed(id) == 0);
		require(detsToDestroy != 0);
		balances[msg.sender] -= detsToDestroy;
		totalDets -= detsToDestroy;
		destructions[id] = DetsDestruction(id, msg.sender, detsToDestroy, iban);
	}

	function getDetsDestroyer(string id) public view returns (address detsDestroyer) {
		return destructions[id].destroyer;
	}
	function getDetsDestroyed(string id) public view returns (uint detsDestroyed) {
		return destructions[id].detsDestroyed;
	}
	function getIban(string id) public view returns (string iban) {
		return destructions[id].iban;
	}

}