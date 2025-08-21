import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      clientAddress,
      freelancerAddress,
      contractId,
      txHash,
      network,
      token,
      amount,
      platformFee,
      milestones,
      deadline
    } = await request.json();

    if (!jobId || !clientAddress || !freelancerAddress || !contractId || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Создаем запись о блокчейн контракте в базе данных
    const escrowRecord = await databases.createDocument(
      DATABASE_ID,
      'crypto_escrows',
      ID.unique(),
      {
        jobId,
        contractId, // ID смарт-контракта
        txHash,
        network,
        token,
        amount: parseFloat(amount),
        platformFee: parseFloat(platformFee),
        milestones: parseInt(milestones),
        deadline: deadline,
        clientAddress,
        freelancerAddress,
        status: 'funded',
        createdAt: new Date().toISOString(),
        events: JSON.stringify([{
          type: 'escrow_created',
          timestamp: new Date().toISOString(),
          txHash,
          data: { amount, token, network }
        }])
      }
    );

    // 2. Обновляем статус джобса
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      jobId,
      {
        status: 'in_progress',
        paymentMethod: 'crypto',
        escrowContractId: contractId,
        escrowTxHash: txHash,
        cryptoNetwork: network,
        cryptoToken: token,
        cryptoAmount: parseFloat(amount),
        updatedAt: new Date().toISOString()
      }
    );

    // 3. Отправляем системное сообщение в чат
    try {
      const conversationId = `job-${jobId}`;
      await EnhancedMessagingService.sendMessage({
        conversationId,
        senderId: 'system',
        receiverId: freelancerAddress,
        content: `🔐 **Escrow контракт создан!**\n\n💰 **Сумма:** ${amount} ${token}\n🌐 **Сеть:** ${network}\n📝 **ID контракта:** \`${contractId.slice(0, 10)}...${contractId.slice(-8)}\`\n🔗 **Транзакция:** \`${txHash.slice(0, 10)}...${txHash.slice(-8)}\`\n\nСредства заблокированы в смарт-контракте до завершения работы.`,
        messageType: 'system',
        metadata: {
          escrowCreated: true,
          contractId,
          txHash,
          network,
          token,
          amount
        }
      });
    } catch (msgError) {
      console.error('Error sending escrow message:', msgError);
    }

    // 4. Создаем уведомления
    try {
      // Уведомление фрилансеру
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: freelancerAddress,
          type: 'escrow_created',
          title: '🔐 Escrow контракт создан',
          message: `Клиент заблокировал ${amount} ${token} в смарт-контракте. Можете приступать к работе!`,
          data: JSON.stringify({
            jobId,
            contractId,
            txHash,
            network,
            amount,
            token,
            explorerUrl: getExplorerUrl(network, txHash),
            chatUrl: `/en/messages?job=${jobId}`
          }),
          isRead: false,
          createdAt: new Date().toISOString()
        }
      );

      // Уведомление клиенту
      const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: job.clientId,
          type: 'payment_secured',
          title: '✅ Платеж защищен',
          message: `Ваш платеж ${amount} ${token} заблокирован в блокчейне. Фрилансер получит средства после завершения работы.`,
          data: JSON.stringify({
            jobId,
            contractId,
            txHash,
            network,
            amount,
            token,
            explorerUrl: getExplorerUrl(network, txHash),
            chatUrl: `/en/messages?job=${jobId}`
          }),
          isRead: false,
          createdAt: new Date().toISOString()
        }
      );
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      escrowId: escrowRecord.$id,
      contractId,
      txHash,
      explorerUrl: getExplorerUrl(network, txHash)
    });

  } catch (error: any) {
    console.error('Error creating escrow record:', error);
    return NextResponse.json(
      { error: 'Failed to create escrow record', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get blockchain explorer URL
function getExplorerUrl(network: string, txHash: string): string {
  const explorers = {
    polygon: `https://polygonscan.com/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
    arbitrum: `https://arbiscan.io/tx/${txHash}`,
    ethereum: `https://etherscan.io/tx/${txHash}`,
  };
  
  return explorers[network as keyof typeof explorers] || `https://etherscan.io/tx/${txHash}`;
}
