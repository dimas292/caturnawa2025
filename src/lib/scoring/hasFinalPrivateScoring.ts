/**
 * Helper function to check if a round's scores should be kept private
 * Used for final rounds where we want to hide scores until officially announced
 */
export function hasFinalPrivateScoring(stage: string, competition: string): boolean {
    // Only consider hiding when this is a FINAL stage
    if (stage !== 'FINAL') return false

    // Competitions for which final-stage scores should remain private until announced
    const privateFinalCompetitions = ['KDBI', 'EDC', 'DCC', 'SPC']

    return privateFinalCompetitions.includes(competition)
}