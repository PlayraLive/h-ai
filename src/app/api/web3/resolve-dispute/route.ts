import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(request: NextRequest) {
  try {
    const {
      disputeId,
      resolution,
      clientPercentage,
      reason,
      arbitratorAddress,
      txHash
    } = await request.json();

    if (!disputeId || !resolution || clientPercentage === undefined || !arbitratorAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Получаем спор
    const dispute = await databases.getDocument(DATABASE_ID, 'disputes', disputeId);
    
    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    if (dispute.status !== 'open') {
      return NextResponse.json(
        { error: 'Dispute already resolved' },
        { status: 400 }
      );
    }

    // 2. Получаем escrow контракт
    const escrow = await databases.getDocument(DATABASE_ID, 'crypto_escrows', dispute.escrowId);

    // 3. Обновляем статус спора
    await databases.updateDocument(
      DATABASE_ID,
      'disputes',
      disputeId,
      {
        status: 'resolved',
        resolution,
        clientPercentage,
        freelancerPercentage: 100 - clientPercentage,
        arbitratorAddress,
        resolvedAt: new Date().toISOString(),
        resolutionReason: reason || '',
        resolutionTxHash: txHash || null,
        updatedAt: new Date().toISOString()
      }
    );

    // 4. Обновляем escrow события
    const currentEvents = JSON.parse(escrow.events || '[]');
    currentEvents.push({
      type: 'dispute_resolved',
      timestamp: new Date().toISOString(),
      txHash: txHash || null,
      data: {
        disputeId,
        resolution,
        clientPercentage,
        freelancerPercentage: 100 - clientPercentage,
        arbitratorAddress,
        reason
      }
    });

    await databases.updateDocument(
      DATABASE_ID,
      'crypto_escrows',
      escrow.$id,
      {
        status: 'resolved',
        events: JSON.stringify(currentEvents),
        updatedAt: new Date().toISOString()
      }
    );

    // 5. Обновляем статус джоба
    const jobStatus = clientPercentage > 50 ? 'cancelled' : 'completed';
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      dispute.jobId,
      {
        status: jobStatus,
        updatedAt: new Date().toISOString()
      }
    );

    // 6. Отправляем уведомления
    const messagingService = new EnhancedMessagingService();
    
    const winner = clientPercentage > 50 ? 'клиента' : 'фрилансера';
    const clientAmount = (escrow.amount * clientPercentage / 100).toFixed(2);
    const freelancerAmount = (escrow.amount * (100 - clientPercentage) / 100).toFixed(2);
    
    try {
      await messagingService.sendSystemMessage({
        jobId: dispute.jobId,
        type: 'dispute_resolved',
        title: 'Спор разрешен',
        content: `⚖️ Спор разрешен в пользу ${winner}. Распределение средств: клиенту $${clientAmount}, фрилансеру $${freelancerAmount}. ${reason ? `Причина: ${reason}` : ''}`,
        metadata: {
          disputeId,
          resolution,
          clientPercentage,
          freelancerPercentage: 100 - clientPercentage,
          clientAmount: parseFloat(clientAmount),
          freelancerAmount: parseFloat(freelancerAmount),
          winner: clientPercentage > 50 ? 'client' : 'freelancer'
        }
      });
    } catch (msgError) {
      console.error('Error sending resolution notification:', msgError);
    }

    return NextResponse.json({
      success: true,
      resolution: {
        disputeId,
        status: 'resolved',
        clientPercentage,
        freelancerPercentage: 100 - clientPercentage,
        clientAmount: parseFloat(clientAmount),
        freelancerAmount: parseFloat(freelancerAmount),
        winner: clientPercentage > 50 ? 'client' : 'freelancer',
        resolvedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}
