import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { EnhancedMessagingService } from '@/lib/services/enhanced-messaging';

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      contractId,
      initiatorAddress,
      reason,
      description,
      evidence,
      txHash
    } = await request.json();

    if (!jobId || !contractId || !initiatorAddress || !reason) {
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

    // 2. Проверяем, что инициатор - участник контракта
    const isClient = escrow.clientAddress === initiatorAddress;
    const isFreelancer = escrow.freelancerAddress === initiatorAddress;
    
    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Only contract parties can start disputes' },
        { status: 403 }
      );
    }

    // 3. Создаем запись о споре
    const dispute = await databases.createDocument(
      DATABASE_ID,
      'disputes', // Нужно создать эту коллекцию
      ID.unique(),
      {
        jobId,
        contractId,
        escrowId: escrow.$id,
        initiatorAddress,
        initiatorType: isClient ? 'client' : 'freelancer',
        reason,
        description: description || '',
        evidence: JSON.stringify(evidence || []),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        txHash: txHash || null
      }
    );

    // 4. Обновляем статус escrow
    const currentEvents = JSON.parse(escrow.events || '[]');
    currentEvents.push({
      type: 'dispute_started',
      timestamp: new Date().toISOString(),
      txHash: txHash || null,
      data: {
        disputeId: dispute.$id,
        initiatorAddress,
        initiatorType: isClient ? 'client' : 'freelancer',
        reason
      }
    });

    await databases.updateDocument(
      DATABASE_ID,
      'crypto_escrows',
      escrow.$id,
      {
        status: 'disputed',
        events: JSON.stringify(currentEvents),
        updatedAt: new Date().toISOString()
      }
    );

    // 5. Обновляем статус джоба
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.JOBS,
      jobId,
      {
        status: 'disputed',
        updatedAt: new Date().toISOString()
      }
    );

    // 6. Отправляем уведомления
    const messagingService = new EnhancedMessagingService();
    
    try {
      await messagingService.sendSystemMessage({
        jobId,
        type: 'dispute_started',
        title: 'Открыт спор',
        content: `⚖️ ${isClient ? 'Клиент' : 'Фрилансер'} открыл спор по проекту. Причина: ${reason}. Все средства заблокированы до разрешения спора.`,
        metadata: {
          disputeId: dispute.$id,
          contractId,
          initiatorType: isClient ? 'client' : 'freelancer',
          reason,
          description
        }
      });
    } catch (msgError) {
      console.error('Error sending dispute notification:', msgError);
    }

    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.$id,
        status: 'open',
        initiatorType: isClient ? 'client' : 'freelancer',
        reason,
        createdAt: dispute.createdAt
      }
    });

  } catch (error) {
    console.error('Error starting dispute:', error);
    return NextResponse.json(
      { error: 'Failed to start dispute' },
      { status: 500 }
    );
  }
}
