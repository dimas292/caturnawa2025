import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ScoreWithJudges = {
  penilaianKaryaTulisIlmiah: number;
  substansiKaryaTulisIlmiah: number;
  kualitasKaryaTulisIlmiah: number;
  judgeName: string;
  judgeId: string;
};

type SubmissionWithScores = {
  id: string;
  judulKarya: string;
  status: string;
  qualifiedToFinal: boolean;
  registration: {
    participant: {
      fullName: string | null;
      institution: string | null;
      email: string | null;
    } | null;
  };
  semifinalScores: ScoreWithJudges[];
};

export async function GET() {
  try {
    // Fetch all SPC submissions with their semifinal scores
    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        status: 'SEMIFINAL' as any // Using 'as any' to bypass the type error
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true,
                email: true
              }
            }
          }
        },
        semifinalScores: true // Include all semifinal scores
      }
    });

    // Calculate average scores
    const leaderboard = submissions.map(submission => {
      const scores = submission.semifinalScores || [];
      const totalJudges = scores.length;
      
      // Calculate average scores
      const avgScores = {
        penilaian: 0,
        substansi: 0,
        kualitas: 0,
        total: 0
      };

      if (totalJudges > 0) {
        avgScores.penilaian = scores.reduce(
          (sum: number, s) => sum + (s.penilaianKaryaTulisIlmiah || 0), 0
        ) / totalJudges;
        
        avgScores.substansi = scores.reduce(
          (sum: number, s) => sum + (s.substansiKaryaTulisIlmiah || 0), 0
        ) / totalJudges;
        
        avgScores.kualitas = scores.reduce(
          (sum: number, s) => sum + (s.kualitasKaryaTulisIlmiah || 0), 0
        ) / totalJudges;
        
        avgScores.total = avgScores.penilaian + avgScores.substansi + avgScores.kualitas;
      }

      return {
        id: submission.id,
        participantName: submission.registration?.participant?.fullName || 'Unknown',
        institution: submission.registration?.participant?.institution || 'Unknown',
        email: submission.registration?.participant?.email || '',
        judulKarya: submission.judulKarya,
        scores: avgScores,
        totalScore: Number(avgScores.total.toFixed(2)),
        judgesCount: totalJudges,
        status: submission.status,
        qualifiedToFinal: submission.qualifiedToFinal
      };
    });

    // Sort by total score in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank and top 6 badge
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
      isTop6: index < 6 // Add flag for top 6 participants
    }));

    return NextResponse.json({
      success: true,
      data: rankedLeaderboard,
      total: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Error fetching SPC leaderboard:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
