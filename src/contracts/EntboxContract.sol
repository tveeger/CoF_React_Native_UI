pragma solidity ^0.4.8;

contract Owned { address public owner;

	function Owned() {
		owner = msg.sender;
	}

	modifier onlyOwner {
		if (msg.sender != owner) throw;
		_;
	}

	function transferOwnership(address newOwner) onlyOwner {
		owner = newOwner;
	}
}

contract StandardToken { mapping( address => uint ) _balances;
	uint public _supply;
	uint256 public totalSupply;

	event Transfer(address indexed from, address indexed to, uint value);

	function totalSupply() constant returns (uint supply) {
		return _supply;
	}

	function balanceOf( address who ) constant returns (uint value) {
		return _balances[who];
	}

	function transfer( address to, uint value) returns (bool success) {
		if( _balances[msg.sender] < value && _balances[to] + value < _balances[to]) {
			throw;
	}
	if( !safeToAdd(_balances[to], value) ) {
		throw;
	}
	_balances[msg.sender] -= value;
	_balances[to] += value;
	Transfer( msg.sender, to, value );
	return true;
	}

	function safeToAdd(uint a, uint b) internal returns (bool) {
	return (a + b >= a);
	}

}


contract EntboxContract is StandardToken, Owned {
	string public constant name = "Chains Of Freedom";
	string public constant symbol = "Dets";
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

	function EntboxContract() {
		owner = msg.sender;
	}

	function getTotalDetsAmount() returns (uint256 detsAmount) {
		return totalDets;
	}

	function storeReceipt(string id, address tokenCreator, uint detsAmount, uint euroAmount) onlyOwner {
		receipts[id] = DetsReceipt(id, tokenCreator, detsAmount, euroAmount,false);
	}
	function getDetsAmountFromReceipt(string id) returns (uint detsAmount) {
		return receipts[id].detsAmount;
	}
	function getEuroAmountFromReceipt(string id) returns (uint euroAmount) {
		return receipts[id].euroAmount;
	}
	function getTokenCreatorFromReceipt(string id) returns (address tokenCreator) {
		return receipts[id].tokenCreator;
	}
	function getTokenCreatedStatusFromReceipt(string id) returns (bool tokenCreatedStatus) {
		return receipts[id].tokenCreatedStatus;
	}

	function createDets(string id) {
		if(receipts[id].tokenCreatedStatus) throw;
		if(getDetsAmountFromReceipt(id) <= 0) throw;
		receipts[id].tokenCreatedStatus = true;
		var addr = getTokenCreatorFromReceipt(id);
		var detsToCreate = getDetsAmountFromReceipt(id);
		balances[addr] += detsToCreate;
		totalSupply += detsToCreate;
	}

	function getDetsBalance(address addr) returns (uint detsAmount) {
		return balances[addr];
	}

	function destroyDets(string id, uint detsToDestroy, string iban) {
		if(balances[msg.sender] < detsToDestroy) throw;
		if(getDetsDestroyed(id)!=0) throw;
		if(detsToDestroy==0) throw;
		balances[msg.sender] -= detsToDestroy;
		totalDets -= detsToDestroy;
		destructions[id] = DetsDestruction(id, msg.sender, detsToDestroy, iban);
	}

	function getDetsDestroyer(string id) returns (address detsDestroyer) {
		return destructions[id].destroyer;
	}
	function getDetsDestroyed(string id) returns (uint detsDestroyed) {
		return destructions[id].detsDestroyed;
	}
	function getIban(string id) returns (string iban) {
		return destructions[id].iban;
	}

}

