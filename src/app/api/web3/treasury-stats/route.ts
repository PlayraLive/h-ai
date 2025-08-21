import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID } from '@/lib/appwrite/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network');
    const period = searchParams.get('period') || '30'; // дни

    // Получаем все escrow контракты за период
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    let query = [
      databases.Query.greaterThan('createdAt', startDate.toISOString()),
      databases.Query.lessThan('createdAt', endDate.toISOString()),
      databases.Query.equal('status', ['completed', 'resolved'])
    ];

    if (network) {
      query.push(databases.Query.equal('network', network));
    }

    const escrows = await databases.listDocuments(
      DATABASE_ID,
      'crypto_escrows',
      query
    );

    // Подсчитываем статистику
    let totalFees = 0;
    let totalVolume = 0;
    let transactionCount = 0;
    const networkStats: Record<string, { fees: number; volume: number; count: number }> = {};
    const tokenStats: Record<string, { fees: number; volume: number; count: number }> = {};

    escrows.documents.forEach(escrow => {
      const fee = parseFloat(escrow.platformFee || '0');
      const amount = parseFloat(escrow.amount || '0');
      const network = escrow.network;
      const token = escrow.token;

      totalFees += fee;
      totalVolume += amount;
      transactionCount++;

      // Статистика по сетям
      if (!networkStats[network]) {
        networkStats[network] = { fees: 0, volume: 0, count: 0 };
      }
      networkStats[network].fees += fee;
      networkStats[network].volume += amount;
      networkStats[network].count++;

      // Статистика по токенам
      if (!tokenStats[token]) {
        tokenStats[token] = { fees: 0, volume: 0, count: 0 };
      }
      tokenStats[token].fees += fee;
      tokenStats[token].volume += amount;
      tokenStats[token].count++;
    });

    // Получаем данные за предыдущий период для сравнения
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - parseInt(period));
    
    const prevEscrows = await databases.listDocuments(
      DATABASE_ID,
      'crypto_escrows',
      [
        databases.Query.greaterThan('createdAt', prevStartDate.toISOString()),
        databases.Query.lessThan('createdAt', startDate.toISOString()),
        databases.Query.equal('status', ['completed', 'resolved'])
      ]
    );

    const prevTotalFees = prevEscrows.documents.reduce(
      (sum, escrow) => sum + parseFloat(escrow.platformFee || '0'), 0
    );

    const feeGrowth = prevTotalFees > 0 
      ? ((totalFees - prevTotalFees) / prevTotalFees) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      period: parseInt(period),
      stats: {
        totalFees: totalFees.toFixed(2),
        totalVolume: totalVolume.toFixed(2),
        transactionCount,
        averageTransactionSize: transactionCount > 0 ? (totalVolume / transactionCount).toFixed(2) : '0',
        feeGrowth: feeGrowth.toFixed(1),
        networkBreakdown: Object.entries(networkStats).map(([network, stats]) => ({
          network,
          fees: stats.fees.toFixed(2),
          volume: stats.volume.toFixed(2),
          count: stats.count,
          percentage: totalFees > 0 ? ((stats.fees / totalFees) * 100).toFixed(1) : '0'
        })),
        tokenBreakdown: Object.entries(tokenStats).map(([token, stats]) => ({
          token,
          fees: stats.fees.toFixed(2),
          volume: stats.volume.toFixed(2),
          count: stats.count,
          percentage: totalFees > 0 ? ((stats.fees / totalFees) * 100).toFixed(1) : '0'
        }))
      }
    });

  } catch (error) {
    console.error('Error getting treasury stats:', error);
    return NextResponse.json(
      { error: 'Failed to get treasury statistics' },
      { status: 500 }
    );
  }
}
