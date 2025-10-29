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
    } | null;
  };
  semifinalScores: ScoreWithJudges[];
};

export async function GET() {
  try {
    // Fetch all SPC submissions with their semifinal scores
    const submissions = await prisma.sPCSubmission.findMany({
      where: {
        status: 'SEMIFINAL' as any
      },
      include: {
        registration: {
          include: {
            participant: {
              select: {
                fullName: true,
                institution: true
              }
            }
          }
        },
        semifinalScores: {
          select: {
            penilaianKaryaTulisIlmiah: true,
            substansiKaryaTulisIlmiah: true,
            kualitasKaryaTulisIlmiah: true,
            judgeName: true,
            judgeId: true
          }
        }
      }
    });

    // Calculate average scores and prepare response
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
        judulKarya: submission.judulKarya,
        avgPenilaian: Number(avgScores.penilaian.toFixed(2)),
        avgSubstansi: Number(avgScores.substansi.toFixed(2)),
        avgKualitas: Number(avgScores.kualitas.toFixed(2)),
        totalScore: Number(avgScores.total.toFixed(2)),
        judgesCount: totalJudges,
        status: submission.status,
        qualifiedToFinal: submission.qualifiedToFinal
      };
    });

    // Sort by total score in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank and top 6 flag
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
      isTop6: index < 6
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
