//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UserRatings is Ownable {

    // structs
    struct User {
        string name;
        address account;
        // user can see all his raters
        address[] ratingsForOthers;
        // user can see all his ratings
        address[] ratingsFromOthers;
    }

    // Users
    address[] public users;
    mapping(address => User) public registeredUsers;
    mapping(address => mapping(address => uint8)) public raterToRateeToRating;
    mapping(address => mapping(address => uint256)) public raterToRateeToTimestamp;

    /*************************************************************************/
    /*                               Views                                */
    /*************************************************************************/

    function ratingsForOthersCount() public view isRegistered(msg.sender) returns (uint) {
        return registeredUsers[msg.sender].ratingsForOthers.length;
    }

    function ratingsFromOthersCount() public view isRegistered(msg.sender) returns (uint) {
        return registeredUsers[msg.sender].ratingsFromOthers.length;
    }

    function ratingFromUser(address _rater, address _ratee) public
        view
        isRegistered(_rater)
        isRegistered(_ratee)
        returns (address, uint8, uint256)
    {
        uint8 rating = raterToRateeToRating[_rater][_ratee];
        uint256 timestamp = raterToRateeToTimestamp[_rater][_ratee];

        return (_ratee, rating, timestamp);
    }

    function ratingFromUserTime(address _rater, address _ratee) public
        view
        isRegistered(msg.sender)
        isRegistered(_rater)
        isRegistered(_ratee)
        returns (uint256)
    {
        return raterToRateeToTimestamp[_rater][_ratee];
    }

    function ratingForUser(address _user) public view isRegistered(msg.sender) returns (uint8) {
        return raterToRateeToRating[msg.sender][_user];
    }

    function userCount() public view returns (uint) {
        return users.length;
    }

    /*************************************************************************/
    /*                               Mutations                                */
    /*************************************************************************/
    function register(string memory name) public {

        User memory u = registeredUsers[msg.sender];

        require(keccak256(abi.encodePacked(u.name)) == keccak256(abi.encodePacked("")), "User is already registered.");

        users.push(msg.sender);

        u.name = name;
        u.account = msg.sender;

        registeredUsers[msg.sender] = u;

        emit UserRegistered(msg.sender, name);
    }

    function rateUser(address _ratee, uint8 rating) public isRegistered(msg.sender) isRegistered(_ratee) {
        require(rating >= 1, "Rating cannot be less than 1");
        require(rating <= 5, "Rating cannot be greater than 5");

        User storage rater = registeredUsers[msg.sender];
        User storage ratee = registeredUsers[_ratee];

        require(raterToRateeToRating[msg.sender][_ratee] == 0, "You have already rated this user.");

        rater.ratingsForOthers.push(_ratee);
        raterToRateeToRating[msg.sender][_ratee] = rating;
        raterToRateeToTimestamp[msg.sender][_ratee] = block.timestamp;

        ratee.ratingsFromOthers.push(msg.sender);

        emit UserRated(msg.sender, _ratee, rating);
    }


    /*************************************************************************/
    /*                               Events                                */
    /*************************************************************************/
    event UserRegistered(address indexed user, string name);
    event UserRated(address indexed rater, address ratee, uint8 rating);

    /*************************************************************************/
    /*                               Modifiers                                */
    /*************************************************************************/
    modifier isRegistered(address _u) {
        User memory u = registeredUsers[_u];

        require(keccak256(abi.encodePacked(u.name)) != keccak256(abi.encodePacked("")), "User must be registered.");

        _;
    }
}
