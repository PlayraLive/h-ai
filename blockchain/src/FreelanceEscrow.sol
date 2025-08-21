// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/utils/Pausable.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FreelanceEscrow
 * @dev Escrow contract for H-AI freelance platform with multi-token support
 * @author H-AI Platform
 */
contract FreelanceEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Структура контракта
    struct Contract {
        address client;
        address freelancer;
        address token;
        uint256 amount;
        uint256 platformFee;
        uint256 deadline;
        ContractStatus status;
        string jobId;
        string ipfsHash; // Для хранения деталей в IPFS
        uint256 createdAt;
        uint256 disputeStartTime;
        mapping(address => bool) approvals;
        uint256 milestones;
        uint256 completedMilestones;
    }

    enum ContractStatus {
        Created,
        Funded,
        InProgress,
        Completed,
        Disputed,
        Cancelled,
        Released
    }

    // События
    event ContractCreated(
        bytes32 indexed contractId,
        address indexed client,
        address indexed freelancer,
        address token,
        uint256 amount,
        string jobId
    );

    event ContractFunded(bytes32 indexed contractId, uint256 amount);
    event ContractCompleted(bytes32 indexed contractId);
    event FundsReleased(bytes32 indexed contractId, address to, uint256 amount);
    event DisputeStarted(bytes32 indexed contractId, address initiator);
    event DisputeResolved(bytes32 indexed contractId, address winner, uint256 clientAmount, uint256 freelancerAmount);
    event MilestoneCompleted(bytes32 indexed contractId, uint256 milestoneIndex, uint256 amount);

    // Маппинги
    mapping(bytes32 => Contract) public contracts;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public arbitrators;
    mapping(bytes32 => bool) public contractExists;

    // Константы
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant MAX_DISPUTE_TIME = 30 days;
    uint256 public platformFeePercentage = 1000; // 10% в базисных пунктах
    address public treasuryWallet;

    // Модификаторы
    modifier onlyContractParties(bytes32 contractId) {
        Contract storage c = contracts[contractId];
        require(
            msg.sender == c.client || msg.sender == c.freelancer,
            "Only contract parties"
        );
        _;
    }

    modifier onlyArbitrator() {
        require(arbitrators[msg.sender], "Only arbitrator");
        _;
    }

    modifier contractInStatus(bytes32 contractId, ContractStatus status) {
        require(contracts[contractId].status == status, "Invalid contract status");
        _;
    }

    constructor(address _treasuryWallet) Ownable(msg.sender) {
        treasuryWallet = _treasuryWallet;
        arbitrators[msg.sender] = true;
    }

    /**
     * @dev Создать новый escrow контракт
     */
    function createContract(
        address _freelancer,
        address _token,
        uint256 _amount,
        uint256 _deadline,
        string calldata _jobId,
        string calldata _ipfsHash,
        uint256 _milestones
    ) external whenNotPaused returns (bytes32) {
        require(supportedTokens[_token], "Token not supported");
        require(_freelancer != address(0), "Invalid freelancer");
        require(_amount > 0, "Amount must be positive");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_milestones > 0, "Must have at least 1 milestone");

        bytes32 contractId = keccak256(
            abi.encodePacked(
                msg.sender,
                _freelancer,
                _token,
                _amount,
                _deadline,
                _jobId,
                block.timestamp
            )
        );

        require(!contractExists[contractId], "Contract already exists");

        Contract storage newContract = contracts[contractId];
        newContract.client = msg.sender;
        newContract.freelancer = _freelancer;
        newContract.token = _token;
        newContract.amount = _amount;
        newContract.platformFee = (_amount * platformFeePercentage) / 10000;
        newContract.deadline = _deadline;
        newContract.status = ContractStatus.Created;
        newContract.jobId = _jobId;
        newContract.ipfsHash = _ipfsHash;
        newContract.createdAt = block.timestamp;
        newContract.milestones = _milestones;
        newContract.completedMilestones = 0;

        contractExists[contractId] = true;

        emit ContractCreated(
            contractId,
            msg.sender,
            _freelancer,
            _token,
            _amount,
            _jobId
        );

        return contractId;
    }

    /**
     * @dev Пополнить escrow контракт
     */
    function fundContract(bytes32 contractId)
        external
        nonReentrant
        whenNotPaused
        contractInStatus(contractId, ContractStatus.Created)
    {
        Contract storage c = contracts[contractId];
        require(msg.sender == c.client, "Only client can fund");

        uint256 totalAmount = c.amount + c.platformFee;
        
        IERC20(c.token).safeTransferFrom(
            msg.sender,
            address(this),
            totalAmount
        );

        c.status = ContractStatus.Funded;

        emit ContractFunded(contractId, totalAmount);
    }

    /**
     * @dev Начать работу (вызывает фрилансер)
     */
    function startWork(bytes32 contractId)
        external
        whenNotPaused
        contractInStatus(contractId, ContractStatus.Funded)
    {
        Contract storage c = contracts[contractId];
        require(msg.sender == c.freelancer, "Only freelancer can start");

        c.status = ContractStatus.InProgress;
    }

    /**
     * @dev Отметить работу как завершенную (клиент)
     */
    function approveCompletion(bytes32 contractId)
        external
        whenNotPaused
        contractInStatus(contractId, ContractStatus.InProgress)
    {
        Contract storage c = contracts[contractId];
        require(msg.sender == c.client, "Only client can approve");

        c.status = ContractStatus.Completed;
        c.approvals[msg.sender] = true;

        emit ContractCompleted(contractId);

        // Автоматически освободить средства через 24 часа
        _releaseFunds(contractId);
    }

    /**
     * @dev Завершить веху проекта
     */
    function completeMilestone(bytes32 contractId, uint256 milestoneIndex)
        external
        whenNotPaused
        contractInStatus(contractId, ContractStatus.InProgress)
    {
        Contract storage c = contracts[contractId];
        require(msg.sender == c.client, "Only client can complete milestone");
        require(milestoneIndex < c.milestones, "Invalid milestone index");
        require(milestoneIndex == c.completedMilestones, "Milestones must be completed in order");

        c.completedMilestones++;
        
        uint256 milestoneAmount = c.amount / c.milestones;
        
        // Освобождаем средства за веху
        IERC20(c.token).safeTransfer(c.freelancer, milestoneAmount);

        emit MilestoneCompleted(contractId, milestoneIndex, milestoneAmount);

        // Если все вехи завершены
        if (c.completedMilestones == c.milestones) {
            c.status = ContractStatus.Completed;
            emit ContractCompleted(contractId);
        }
    }

    /**
     * @dev Начать спор
     */
    function startDispute(bytes32 contractId)
        external
        whenNotPaused
        onlyContractParties(contractId)
    {
        Contract storage c = contracts[contractId];
        require(
            c.status == ContractStatus.InProgress ||
            c.status == ContractStatus.Completed,
            "Cannot dispute in current status"
        );

        c.status = ContractStatus.Disputed;
        c.disputeStartTime = block.timestamp;

        emit DisputeStarted(contractId, msg.sender);
    }

    /**
     * @dev Разрешить спор (только арбитр)
     */
    function resolveDispute(
        bytes32 contractId,
        uint256 clientPercentage,
        string calldata reason
    ) external onlyArbitrator whenNotPaused {
        Contract storage c = contracts[contractId];
        require(c.status == ContractStatus.Disputed, "No active dispute");
        require(clientPercentage <= 100, "Invalid percentage");

        uint256 clientAmount = (c.amount * clientPercentage) / 100;
        uint256 freelancerAmount = c.amount - clientAmount;

        // Переводим средства
        if (clientAmount > 0) {
            IERC20(c.token).safeTransfer(c.client, clientAmount);
        }
        if (freelancerAmount > 0) {
            IERC20(c.token).safeTransfer(c.freelancer, freelancerAmount);
        }

        // Комиссия платформы всегда идет в treasury
        IERC20(c.token).safeTransfer(treasuryWallet, c.platformFee);

        c.status = ContractStatus.Released;

        emit DisputeResolved(contractId, 
            clientPercentage > 50 ? c.client : c.freelancer,
            clientAmount, 
            freelancerAmount
        );
    }

    /**
     * @dev Освободить средства (внутренняя функция)
     */
    function _releaseFunds(bytes32 contractId) internal {
        Contract storage c = contracts[contractId];
        require(c.status == ContractStatus.Completed, "Not completed");

        // Если используются вехи и не все завершены
        if (c.milestones > 1 && c.completedMilestones < c.milestones) {
            uint256 remainingAmount = c.amount - ((c.amount / c.milestones) * c.completedMilestones);
            IERC20(c.token).safeTransfer(c.freelancer, remainingAmount);
        } else if (c.milestones == 1) {
            // Обычный контракт без вех
            IERC20(c.token).safeTransfer(c.freelancer, c.amount);
        }

        // Комиссия платформы
        IERC20(c.token).safeTransfer(treasuryWallet, c.platformFee);

        c.status = ContractStatus.Released;

        emit FundsReleased(contractId, c.freelancer, c.amount);
    }

    /**
     * @dev Экстренное освобождение средств (если прошел таймаут)
     */
    function emergencyRelease(bytes32 contractId)
        external
        nonReentrant
        onlyContractParties(contractId)
    {
        Contract storage c = contracts[contractId];
        require(
            block.timestamp > c.deadline + MAX_DISPUTE_TIME,
            "Emergency release not available yet"
        );
        require(
            c.status == ContractStatus.InProgress ||
            c.status == ContractStatus.Disputed,
            "Invalid status for emergency release"
        );

        // В случае экстренного освобождения средства возвращаются клиенту
        IERC20(c.token).safeTransfer(c.client, c.amount);
        IERC20(c.token).safeTransfer(treasuryWallet, c.platformFee);

        c.status = ContractStatus.Cancelled;
    }

    // Функции администратора
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function addArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = true;
    }

    function removeArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = false;
    }

    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Максимум 10%
        platformFeePercentage = newFeePercentage;
    }

    function setTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasuryWallet = newTreasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View функции
    function getContractDetails(bytes32 contractId)
        external
        view
        returns (
            address client,
            address freelancer,
            address token,
            uint256 amount,
            uint256 platformFee,
            uint256 deadline,
            ContractStatus status,
            string memory jobId,
            uint256 milestones,
            uint256 completedMilestones
        )
    {
        Contract storage c = contracts[contractId];
        return (
            c.client,
            c.freelancer,
            c.token,
            c.amount,
            c.platformFee,
            c.deadline,
            c.status,
            c.jobId,
            c.milestones,
            c.completedMilestones
        );
    }

    function isContractParty(bytes32 contractId, address user)
        external
        view
        returns (bool)
    {
        Contract storage c = contracts[contractId];
        return user == c.client || user == c.freelancer;
    }
}
