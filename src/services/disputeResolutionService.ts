import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite/database';
import { FreelanceEscrow } from '@/lib/web3/contracts/FreelanceEscrow';
import { ethers } from 'ethers';

export interface Dispute {
  $id?: string;
  jobId: string;
  contractId: string;
  initiatorId: string;
  initiatorType: 'client' | 'freelancer';
  reason: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'in_review' | 'resolved' | 'cancelled' | 'admin_review';
  arbitratorId?: string;
  resolution?: 'client_wins' | 'freelancer_wins' | 'split' | 'cancelled';
  clientAmount?: number;
  freelancerAmount?: number;
  createdAt: string;
  updatedAt: string;
  blockchainTxHash?: string;
  adminCall?: {
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    calledAt: string;
    status: 'pending' | 'in_progress' | 'resolved';
    adminId?: string;
    adminNotes?: string;
    resolvedAt?: string;
  };
}

export interface DisputeEvidence {
  type: 'message' | 'file' | 'screenshot' | 'contract' | 'other';
  content: string;
  fileUrl?: string;
  timestamp: string;
}

export interface DisputeResolution {
  winner: 'client' | 'freelancer' | 'split';
  clientAmount: number;
  freelancerAmount: number;
  reason: string;
  arbitratorNotes?: string;
}

export class DisputeResolutionService {
  private static readonly DISPUTE_COLLECTION = 'disputes';
  private static readonly ESCROW_COLLECTION = 'crypto_escrows';

  /**
   * Создать новый спор
   */
  static async createDispute(
    jobId: string,
    contractId: string,
    initiatorId: string,
    initiatorType: 'client' | 'freelancer',
    reason: string,
    description: string,
    evidence: string[] = []
  ): Promise<Dispute> {
    try {
      console.log('🔍 Создание спора для джобса:', jobId);
      
      // Проверяем что escrow контракт существует
      const escrowRecord = await databases.getDocument(
        DATABASE_ID,
        this.ESCROW_COLLECTION,
        contractId
      );

      if (!escrowRecord) {
        throw new Error('Escrow контракт не найден');
      }

      // Создаем запись о споре
      const dispute = await databases.createDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        ID.unique(),
        {
          jobId,
          contractId,
          initiatorId,
          initiatorType,
          reason,
          description,
          evidence,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ Спор создан:', dispute.$id);

      // TODO: Вызвать смарт-контракт для блокировки средств
      // await this.lockFundsInContract(contractId);

      return dispute as Dispute;
    } catch (error) {
      console.error('❌ Ошибка создания спора:', error);
      throw new Error('Failed to create dispute');
    }
  }

  /**
   * Получить все споры для джобса
   */
  static async getJobDisputes(jobId: string): Promise<Dispute[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        [
          // Query.equal('jobId', jobId),
          // Query.orderDesc('$createdAt')
        ]
      );

      // Фильтруем по jobId так как Appwrite не поддерживает сложные запросы
      const disputes = response.documents.filter(doc => doc.jobId === jobId);
      
      return disputes as Dispute[];
    } catch (error) {
      console.error('Error getting job disputes:', error);
      return [];
    }
  }

  /**
   * Получить спор по ID
   */
  static async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const dispute = await databases.getDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId
      );
      
      return dispute as Dispute;
    } catch (error) {
      console.error('Error getting dispute:', error);
      return null;
    }
  }

  /**
   * Добавить доказательства к спору
   */
  static async addEvidence(
    disputeId: string,
    evidence: DisputeEvidence
  ): Promise<boolean> {
    try {
      const dispute = await this.getDispute(disputeId);
      if (!dispute) {
        throw new Error('Спор не найден');
      }

      const updatedEvidence = [...(dispute.evidence || []), JSON.stringify(evidence)];
      
      await databases.updateDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId,
        {
          evidence: updatedEvidence,
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ Доказательства добавлены к спору:', disputeId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка добавления доказательств:', error);
      return false;
    }
  }

  /**
   * Назначить арбитра для спора
   */
  static async assignArbitrator(
    disputeId: string,
    arbitratorId: string
  ): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId,
        {
          arbitratorId,
          status: 'in_review',
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ Арбитр назначен для спора:', disputeId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка назначения арбитра:', error);
      return false;
    }
  }

  /**
   * Разрешить спор
   */
  static async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    arbitratorId: string
  ): Promise<boolean> {
    try {
      console.log('🔍 Разрешение спора:', disputeId, resolution);

      // Обновляем статус спора
      await databases.updateDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId,
        {
          status: 'resolved',
          resolution: resolution.winner,
          clientAmount: resolution.clientAmount,
          freelancerAmount: resolution.freelancerAmount,
          arbitratorId,
          updatedAt: new Date().toISOString()
        }
      );

      // TODO: Вызвать смарт-контракт для распределения средств
      // const txHash = await this.distributeFundsInContract(disputeId, resolution);
      
      // if (txHash) {
      //   await databases.updateDocument(
      //     DATABASE_ID,
      //     this.DISPUTE_COLLECTION,
      //     disputeId,
      //     {
      //       blockchainTxHash: txHash
      //     }
      //   );
      // }

      console.log('✅ Спор разрешен:', disputeId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка разрешения спора:', error);
      return false;
    }
  }

  /**
   * Отменить спор
   */
  static async cancelDispute(disputeId: string): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId,
        {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ Спор отменен:', disputeId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отмены спора:', error);
      return false;
    }
  }

  /**
   * Призвать администратора для разрешения спора
   */
  static async callAdmin(
    disputeId: string,
    reason: string,
    urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> {
    try {
      console.log('🚨 Призыв администратора для спора:', disputeId, 'Причина:', reason, 'Срочность:', urgency);

      // Обновляем статус спора
      await databases.updateDocument(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        disputeId,
        {
          status: 'admin_review',
          updatedAt: new Date().toISOString(),
          adminCall: {
            reason,
            urgency,
            calledAt: new Date().toISOString(),
            status: 'pending'
          }
        }
      );

      // TODO: Отправить уведомление администраторам
      // await this.notifyAdmins(disputeId, reason, urgency);

      // TODO: Создать тикет в системе поддержки
      // await this.createSupportTicket(disputeId, reason, urgency);

      console.log('✅ Администратор призван для спора:', disputeId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка призыва администратора:', error);
      return false;
    }
  }

  /**
   * Получить споры требующие вмешательства администратора
   */
  static async getAdminRequiredDisputes(): Promise<Dispute[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        [Query.limit(1000)]
      );

      // Фильтруем споры требующие вмешательства админа
      const adminDisputes = response.documents.filter(doc => 
        doc.status === 'admin_review' || 
        (doc as any).adminCall?.status === 'pending'
      );
      
      return adminDisputes as Dispute[];
    } catch (error) {
      console.error('Error getting admin required disputes:', error);
      return [];
    }
  }

  /**
   * Получить статистику споров
   */
  static async getDisputeStats(): Promise<{
    total: number;
    pending: number;
    inReview: number;
    resolved: number;
    cancelled: number;
    adminReview: number;
  }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        [Query.limit(1000)]
      );

      const disputes = response.documents;
      
      return {
        total: disputes.length,
        pending: disputes.filter(d => d.status === 'pending').length,
        inReview: disputes.filter(d => d.status === 'in_review').length,
        resolved: disputes.filter(d => d.status === 'resolved').length,
        cancelled: disputes.filter(d => d.status === 'cancelled').length,
        adminReview: disputes.filter(d => d.status === 'admin_review').length
      };
    } catch (error) {
      console.error('Error getting dispute stats:', error);
      return {
        total: 0,
        pending: 0,
        inReview: 0,
        resolved: 0,
        cancelled: 0,
        adminReview: 0
      };
    }
  }

  /**
   * Проверить статус спора в блокчейне
   */
  static async checkBlockchainStatus(contractId: string): Promise<{
    status: string;
    lockedAmount: string;
    disputeActive: boolean;
  } | null> {
    try {
      // TODO: Реализовать проверку через Web3
      // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      // const contract = new ethers.Contract(contractId, FreelanceEscrow.abi, provider);
      
      // const status = await contract.getContractStatus();
      // const lockedAmount = await contract.getLockedAmount();
      // const disputeActive = await contract.isDisputeActive();

      return {
        status: 'unknown',
        lockedAmount: '0',
        disputeActive: false
      };
    } catch (error) {
      console.error('Error checking blockchain status:', error);
      return null;
    }
  }

  /**
   * Создать IPFS хеш для доказательств
   */
  static async createEvidenceHash(evidence: DisputeEvidence[]): Promise<string> {
    try {
      // TODO: Реализовать загрузку в IPFS
      const evidenceString = JSON.stringify(evidence);
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(evidenceString));
      
      return hash;
    } catch (error) {
      console.error('Error creating evidence hash:', error);
      return '';
    }
  }

  /**
   * Получить историю споров пользователя
   */
  static async getUserDisputes(userId: string): Promise<Dispute[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.DISPUTE_COLLECTION,
        [Query.limit(1000)]
      );

      // Фильтруем споры где пользователь участвует
      const disputes = response.documents.filter(doc => 
        doc.initiatorId === userId || 
        doc.arbitratorId === userId
      );
      
      return disputes as Dispute[];
    } catch (error) {
      console.error('Error getting user disputes:', error);
      return [];
    }
  }
}
