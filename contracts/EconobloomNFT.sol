// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Econobloom is ERC721, ERC721URIStorage, Ownable {
    struct Plant {
        uint256 growthStage;
        bool isEligibleForGrowth;
    }

    mapping(uint256 => Plant) public plants;

    // Mapping from token ID to plant type
    mapping(uint256 => string) private _plantTypes;
    uint256 private _tokenIdCounter;

    event GrowthStageUpdated(uint256 indexed tokenId, uint256 newGrowthStage);
    event PlantMinted(uint256 indexed tokenId, address owner, string plantType);
    event PlantWatered(uint256 indexed tokenId, uint256 timestamp);

    constructor(
        address initialOwner
    ) ERC721("Econobloom", "EBLOOM") Ownable(initialOwner) {
        _tokenIdCounter = 0;
    }

    // Function to mint a new plant with a specified type
    function safeMint(address to, string memory plantType) public onlyOwner {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        _plantTypes[tokenId] = plantType;
        emit PlantMinted(tokenId, to, plantType);
    }

    function setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) public onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    function waterPlant(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can water the plant"
        );
        emit PlantWatered(tokenId, block.timestamp);
    }

    function updateGrowthStage(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the plant owner can update the growth stage."
        );
        require(
            plants[tokenId].isEligibleForGrowth,
            "This plant is not eligible for growth."
        );

        plants[tokenId].growthStage += 1;
        plants[tokenId].isEligibleForGrowth = false; // Reset eligibility until next off-chain check
        emit GrowthStageUpdated(tokenId, plants[tokenId].growthStage);
    }

    function setEligibility(
        uint256 tokenId,
        bool eligibility
    ) public onlyOwner {
        plants[tokenId].isEligibleForGrowth = eligibility;
    }

    function getPlantType(uint256 tokenId) public view returns (string memory) {
        // This will revert if the token does not exist
        return _plantTypes[tokenId];
    }

    function getPlant(uint256 tokenId) public view returns (Plant memory) {
        return plants[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
