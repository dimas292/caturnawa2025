import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type FinalScoreWithJudges = {
  pemaparanMateriPresentasi: number;
  pertanyaanJawaban: number;
  aspekKesesuaianTema: number;
  judgeName: string;
  judgeId: string;
  total: number;
};

type SubmissionWithFinalScores = {
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
  finalScores: FinalScoreWithJudges[];
};

export async function GET() {
  try {
    // Fetch all SPC submissions with their final scores
    const submissions = await (prisma as any).sPCSubmission.findMany({
      where: {
        qualifiedToFinal: true
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
        finalScores: {
          select: {
            pemaparanMateriPresentasi: true,
            pertanyaanJawaban: true,
            aspekKesesuaianTema: true,
            judgeName: true,
            judgeId: true,
            total: true
          }
        }
      }
    });

    // Calculate average scores and prepare response
    const leaderboard = submissions.map((submission: any) => {
      const scores = submission.finalScores || [];
      const totalJudges = scores.length;
      
      // Calculate average scores
      const avgScores = {
        pemaparan: 0,
        pertanyaan: 0,
        kesesuaian: 0,
        total: 0
      };

      if (totalJudges > 0) {
        avgScores.pemaparan = scores.reduce(
          (sum: number, s: any) => sum + (s.pemaparanMateriPresentasi || 0), 0
        ) / totalJudges;
        
        avgScores.pertanyaan = scores.reduce(
          (sum: number, s: any) => sum + (s.pertanyaanJawaban || 0), 0
        ) / totalJudges;
        
        avgScores.kesesuaian = scores.reduce(
          (sum: number, s: any) => sum + (s.aspekKesesuaianTema || 0), 0
        ) / totalJudges;
        
        avgScores.total = avgScores.pemaparan + avgScores.pertanyaan + avgScores.kesesuaian;
      }

      return {
        id: submission.id,
        participantName: submission.registration?.participant?.fullName || 'Unknown',
        institution: submission.registration?.participant?.institution || 'Unknown',
        judulKarya: submission.judulKarya,
        avgPemaparan: Number(avgScores.pemaparan.toFixed(2)),
        avgPertanyaan: Number(avgScores.pertanyaan.toFixed(2)),
        avgKesesuaian: Number(avgScores.kesesuaian.toFixed(2)),
        totalScore: Number(avgScores.total.toFixed(2)),
        judgesCount: totalJudges,
        status: submission.status
      };
    });

    // Sort by total score in descending order
    leaderboard.sort((a: any, b: any) => b.totalScore - a.totalScore);

    // Add rank and top 3 flag
    const rankedLeaderboard = leaderboard.map((item: any, index: number) => ({
      ...item,
      rank: index + 1,
      isTop3: index < 3
    }));

    return NextResponse.json({
      success: true,
      data: rankedLeaderboard,
      total: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Error fetching SPC final leaderboard:', error);
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
