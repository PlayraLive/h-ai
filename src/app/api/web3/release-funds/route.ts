import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      contractId,
      clientAddress,
      freelancerAddress,
      txHash,
      releaseType = 'completion' // 'completion' | 'approval' | 'emergency'
    } = await request.json();

    if (!jobId || !contractId || !clientAddress || !freelancerAddress || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Получаем escrow контракт
    const escrowDocs = await databases.listDocuments(
      DATABASE_ID,
      'crypto_escrows',
      [
        databases.Query.equal('contractId', contractId),
        databases.Query.equal('jobId', jobId)
      ]
    );

    if (escrowDocs.documents.length === 0) {
      return NextResponse.json(
        { error: 'Escrow contract not found' },
        { status: 404 }
      );
    }

    const escrow = escrowDocs.documents[0];

    // 2. Проверяем статус контракта
    if (escrow.status === 'released') {
      return NextResponse.json(
        { error: 'Funds already released' },
        { status: 400 }
      );
    }

    // 3. Обновляем события escrow
    const currentEvents = JSON.parse(escrow.events || '[]');
    currentEvents.push({
      type: 'funds_released',
      timestamp: new Date().toISOString(),
      txHash,
      data: {
        releaseType,
        clientAddress,
        freelancerAddress,
        amount: escrow.amount,
        platformFee: escrow.platformFee
      }
    });

    // 4. Обновляем статус escrow
    await databases.updateDocument(
      DATABASE_ID,
      'crypto_escrows',
      escrow.$id,
      {
        status: 'released',
        releasedAt: new Date().toISOString(),
        releaseTxHash: txHash,
        releaseType,
        events: JSON.stringify(currentEvents),
        updatedAt: new Date().toISOString()
      }
    );

    // 5. Обновляем статус джоба
    const jobStatus = releaseType === 'emergency' ? 'cancelled' : 'completed';
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      jobId,
      {
        status: jobStatus,
        completedAt: releaseType !== 'emergency' ? new Date().toISOString() : undefined,
        cancelledAt: releaseType === 'emergency' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      }
    );

    // 6. Обновляем статистику пользователей
    try {
      // Обновляем статистику фрилансера
      const freelancerDocs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [databases.Query.equal('walletAddress', freelancerAddress)]
      );

      if (freelancerDocs.documents.length > 0) {
        const freelancer = freelancerDocs.documents[0];
        const currentEarnings = parseFloat(freelancer.totalEarnings || '0');
        const currentJobs = parseInt(freelancer.completedJobs || '0');

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          freelancer.$id,
          {
            totalEarnings: currentEarnings + parseFloat(escrow.amount),
            completedJobs: releaseType !== 'emergency' ? currentJobs + 1 : currentJobs,
            updatedAt: new Date().toISOString()
          }
        );
      }

      // Обновляем статистику клиента
      const clientDocs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [databases.Query.equal('walletAddress', clientAddress)]
      );

      if (clientDocs.documents.length > 0) {
        const client = clientDocs.documents[0];
        const currentSpent = parseFloat(client.totalSpent || '0');
        const currentProjects = parseInt(client.completedProjects || '0');

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          client.$id,
          {
            totalSpent: releaseType !== 'emergency' 
              ? currentSpent + parseFloat(escrow.amount) + parseFloat(escrow.platformFee)
              : currentSpent,
            completedProjects: releaseType !== 'emergency' ? currentProjects + 1 : currentProjects,
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (statsError) {
      console.error('Error updating user statistics:', statsError);
    }

    // 7. Отправляем системное сообщение
    const messagingService = new EnhancedMessagingService();
    
    let messageContent = '';
    let messageTitle = '';

    switch (releaseType) {
      case 'completion':
        messageTitle = 'Проект завершен';
        messageContent = `🎉 Проект успешно завершен! Средства переведены фрилансеру: $${escrow.amount}. Комиссия платформы: $${escrow.platformFee}`;
        break;
      case 'approval':
        messageTitle = 'Средства переведены';
        messageContent = `✅ Клиент подтвердил выполнение работы. Средства переведены фрилансеру: $${escrow.amount}`;
        break;
      case 'emergency':
        messageTitle = 'Экстренное освобождение';
        messageContent = `⚠️ Средства возвращены клиенту по истечении срока: $${escrow.amount}`;
        break;
    }

    try {
      await messagingService.sendSystemMessage({
        jobId,
        type: 'funds_released',
        title: messageTitle,
        content: messageContent,
        metadata: {
          contractId,
          releaseType,
          amount: parseFloat(escrow.amount),
          platformFee: parseFloat(escrow.platformFee),
          txHash,
          recipient: releaseType === 'emergency' ? 'client' : 'freelancer'
        }
      });
    } catch (msgError) {
      console.error('Error sending release notification:', msgError);
    }

    return NextResponse.json({
      success: true,
      release: {
        contractId,
        releaseType,
        amount: parseFloat(escrow.amount),
        platformFee: parseFloat(escrow.platformFee),
        recipient: releaseType === 'emergency' ? clientAddress : freelancerAddress,
        txHash,
        releasedAt: new Date().toISOString()
      },
      job: {
        id: jobId,
        status: jobStatus,
        completedAt: releaseType !== 'emergency' ? new Date().toISOString() : undefined
      }
    });

  } catch (error) {
    console.error('Error releasing funds:', error);
    return NextResponse.json(
      { error: 'Failed to release funds' },
      { status: 500 }
    );
  }
}
