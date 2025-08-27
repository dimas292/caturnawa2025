"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, CheckCircle, Users, CreditCard, Info } from "lucide-react"
import { CompetitionData } from "@/types/registration"

interface CompetitionSelectionProps {
  competitions: CompetitionData[]
  selectedCompetition: CompetitionData | null
  onCompetitionSelect: (competition: CompetitionData) => void
  getCurrentPrice: (competition: CompetitionData) => number
  getPhaseLabel: () => string
}

export function CompetitionSelection({
  competitions,
  selectedCompetition,
  onCompetitionSelect,
  getCurrentPrice,
  getPhaseLabel
}: CompetitionSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Pilih Kompetisi</span>
        </CardTitle>
        <CardDescription>
          Pilih kategori lomba yang ingin Anda ikuti (hanya dapat memilih 1 kategori)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {competitions.map((comp) => (
            <Card 
              key={comp.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCompetition?.id === comp.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => onCompetitionSelect(comp)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                    
                      <div>
                        <h3 className="font-semibold">{comp.name}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {comp.category}
                        </Badge>
                      </div>
                    </div>
                    {selectedCompetition?.id === comp.id && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{comp.teamSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Rp {getCurrentPrice(comp).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="w-fit">
                    {getPhaseLabel()} - Aktif
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedCompetition && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Informasi Kompetisi Terpilih</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Kompetisi:</strong> {selectedCompetition.name}</p>
                  <p><strong>Format Tim:</strong> {selectedCompetition.teamSize}</p>
                  <p><strong>Biaya:</strong> Rp {getCurrentPrice(selectedCompetition).toLocaleString("id-ID")} ({getPhaseLabel()})</p>
                  <p><strong>Kategori:</strong> {selectedCompetition.category}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
