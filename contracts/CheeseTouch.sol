pragma solidity ^0.5.0;

contract CheeseTouch {
	address touchHolder;
	uint256 totalSupply_;

	function getTouchHolder() public view returns (address) { //public view on who is currently touched
  		return touchHolder;
	}

	function transfer(address touchee) public returns (bool) { //transfer function that only works if the sender has the touch
		require(msg.sender == touchHolder);
		touchHolder = touchee;
		return true;
	}

    function startTouch() public returns (bool) { //start a new one under the condition that touch holder is empty
        require(touchHolder == address(0));
        touchHolder = msg.sender;
        return true;
    }
}