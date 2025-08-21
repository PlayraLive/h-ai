import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      contractId,
      milestoneIndex,
      txHash,
      amount,
      clientAddress,
      freelancerAddress
    } = await request.json();

    if (!jobId || !contractId || milestoneIndex === undefined || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Получаем текущий escrow контракт
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
    const currentEvents = JSON.parse(escrow.events || '[]');

    // 2. Добавляем событие завершения milestone
    const milestoneEvent = {
      type: 'milestone_completed',
      timestamp: new Date().toISOString(),
      txHash,
      milestoneIndex,
      amount: parseFloat(amount),
      data: { milestoneIndex, amount, clientAddress, freelancerAddress }
    };

    currentEvents.push(milestoneEvent);

    // 3. Обновляем escrow запись
    await databases.updateDocument(
      DATABASE_ID,
      'crypto_escrows',
      escrow.$id,
      {
        completedMilestones: (escrow.completedMilestones || 0) + 1,
        events: JSON.stringify(currentEvents),
        updatedAt: new Date().toISOString()
      }
    );

    // 4. Проверяем, завершены ли все milestones
    const totalMilestones = escrow.milestones || 1;
    const completedMilestones = (escrow.completedMilestones || 0) + 1;
    const isProjectCompleted = completedMilestones >= totalMilestones;

    // 5. Если все milestones завершены, обновляем статус джоба
    if (isProjectCompleted) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId,
        {
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Обновляем статус escrow
      await databases.updateDocument(
        DATABASE_ID,
        'crypto_escrows',
        escrow.$id,
        {
          status: 'completed'
        }
      );
    }

    // 6. Отправляем системное сообщение
    const messagingService = new EnhancedMessagingService();
    
    const milestoneMessage = isProjectCompleted 
      ? `🎉 Проект завершен! Все ${totalMilestones} этапов выполнены. Средства переведены фрилансеру.`
      : `✅ Этап ${milestoneIndex + 1}/${totalMilestones} завершен! Выплачено: $${amount}. Транзакция: ${txHash.substring(0, 10)}...`;

    try {
      await messagingService.sendSystemMessage({
        jobId,
        type: isProjectCompleted ? 'project_completed' : 'milestone_completed',
        title: isProjectCompleted ? 'Проект завершен' : 'Этап завершен',
        content: milestoneMessage,
        metadata: {
          contractId,
          milestoneIndex,
          amount,
          txHash,
          isProjectCompleted,
          completedMilestones,
          totalMilestones
        }
      });
    } catch (msgError) {
      console.error('Error sending milestone message:', msgError);
    }

    return NextResponse.json({
      success: true,
      milestone: {
        index: milestoneIndex,
        amount,
        txHash,
        completedAt: new Date().toISOString()
      },
      project: {
        isCompleted: isProjectCompleted,
        completedMilestones,
        totalMilestones
      }
    });

  } catch (error) {
    console.error('Error completing milestone:', error);
    return NextResponse.json(
      { error: 'Failed to complete milestone' },
      { status: 500 }
    );
  }
}
