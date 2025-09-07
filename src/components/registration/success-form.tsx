"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, FileText, Download } from "lucide-react"
import Link from "next/link"
import { CompetitionData } from "@/types/registration"

interface SuccessFormProps {
  selectedCompetition: CompetitionData | null
  getCurrentPrice: (competition: CompetitionData) => number
  registrationId?: string
  teamName?: string
  members?: any[]
}

export function SuccessForm({ selectedCompetition, getCurrentPrice, registrationId, teamName, members }: SuccessFormProps) {
  
  const downloadInvoice = () => {
    if (!selectedCompetition) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedCompetition.name}</title>
          <meta charset="UTF-8">
          <style>
            /* ========== ATUR PRINT PAGE ========== */
            @page {
              margin: 0.5cm;
              size: A4 portrait;
            }

            /* ========== RESET & PRINT ========== */
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              font-family: Arial, sans-serif;
              background: white;
              color: black;
              font-size: 12px;
            }

            @media print {
              .no-print, script, .print-button {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                overflow: hidden !important;
              }
            }

            /* ========== KONTAINER UTAMA ========== */
            .invoice-container {
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border: 1px solid #ddd;
              height: 100%;
              max-height: 100vh;
              overflow: hidden;
              box-sizing: border-box;
            }

            .content {
              position: relative;
              z-index: 2;
            }

            /* ========== WATERMARK ========== */
            .invoice-container img[alt=""] {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 100%;
              max-width: 1500px;
              height: auto;
              transform: translate(-50%, -50%) rotate(-25deg);
              opacity: 0.05;
              z-index: 1;
              pointer-events: none;
              object-fit: contain;
              object-position: center;
            }

            /* ========== HEADER ========== */
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header img {
              height: 60px;
              margin-bottom: 10px;
            }
            .logo {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .subtitle {
              color: #666;
              font-size: 14px;
            }

            /* ========== TITLE ========== */
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 20px;
              text-align: center;
            }

            /* ========== DETAILS GRID ========== */
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .detail-group h3 {
              color: #333;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              padding: 3px 0;
            }
            .detail-label {
              color: #666;
              font-weight: 500;
            }
            .detail-value {
              color: #333;
              font-weight: 600;
            }

            /* ========== TEAM ========== */
            .team-info {
              margin-bottom: 20px;
            }
            .team-info h3 {
              color: #333;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .member-item {
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 8px;
              border-radius: 4px;
              font-size: 12px;
            }
            .member-name {
              font-weight: bold;
              color: #333;
              margin-bottom: 3px;
              font-size: 13px;
            }
            .member-details {
              color: #666;
              font-size: 12px;
            }

            /* ========== TOTAL ========== */
            .total-section {
              border-top: 2px solid #333;
              padding-top: 15px;
              text-align: right;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }

            /* ========== FOOTER ========== */
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- WATERMARK RESPONSIF -->
            <img src="/image/caturnawa/01.png" alt="" 
                style="
                position: absolute;
                top: 50%;
                left: 50%;
                max-width: 2000px;
                max-height: 2000px;
                height: 100%;
                width: 100%;
                transform: translate(-50%, -50%);
                opacity: 0.05;
                z-index: 1;
                pointer-events: none;
                object-fit: cover;
              "/>

            <div class="content">
              <div class="header">
                <div class="logo">UNAS FEST 2025</div>
              </div>
              
              <div class="invoice-title">INVOICE</div>
              
              <div class="invoice-details">
                <div class="detail-group">
                  <h3>Registration Details</h3>
                  <div class="detail-item">
                    <span class="detail-label">Invoice Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">#${registrationId || 'REG-' + Date.now().toString().slice(-6)}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Competition:</span>
                    <span class="detail-value">${selectedCompetition.name}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${selectedCompetition.category}</span>
                  </div>
                </div>
                
                <div class="detail-group">
                  <h3>Payment Information</h3>
                  <div class="detail-item">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value">Pending</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">Bank Transfer</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
              
              ${teamName ? `
              <div class="team-info">
                <h3>Team Information</h3>
                <div class="detail-item">
                  <span class="detail-label">Team Name:</span>
                  <span class="detail-value">${teamName}</span>
                </div>
              </div>
              ` : ''}
              
              ${members && members.length > 0 ? `
              <div class="team-info">
                <h3>Team Members</h3>
                ${members.map((member, index) => `
                  <div class="member-item">
                    <div class="member-name">${member.role === 'LEADER' ? 'Member 1' : `Member ${index + 1}`}</div>
                    <div class="member-details">
                      <div>Name: ${member.fullName}</div>
                      <div>Email: ${member.email}</div>
                      <div>Institution: ${member.institution}</div>
                      <div>Student ID: ${member.studentId}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              <div class="total-section">
                <div class="detail-item">
                  <span class="detail-label">Registration Fee:</span>
                  <span class="detail-value">Rp ${getCurrentPrice(selectedCompetition).toLocaleString("id-ID")}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value total-amount">Rp ${getCurrentPrice(selectedCompetition).toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <div class="footer">
                <p><strong>Thank you for participating in UNAS FEST 2025!</strong></p>
                <p>For any questions, please contact our support team.</p>
                <p>Generated on ${new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `

    // Debug: log the HTML to check if changes are applied
    console.log('🔍 Invoice HTML contains:', invoiceHTML.includes('Member 1') ? 'Member 1 ✅' : 'NOT Member 1 ❌')
    
    // Buka window baru dengan invoice
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      // Auto print setelah load
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    } else {
      // Fallback: download HTML file jika popup diblokir
      const blob = new Blob([invoiceHTML], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${selectedCompetition.shortName || 'competition'}-${Date.now()}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
  
  if (!selectedCompetition) return null

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-600">Registration Successful!</h2>
        <p className="text-muted-foreground">
          Your registration for {selectedCompetition.name} has been successfully submitted.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration ID:</span>
              <span className="font-mono font-medium">#REG-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competition:</span>
              <span className="font-medium">{selectedCompetition.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Pending Verification</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Fee:</span>
              <span className="font-medium">
                Rp {getCurrentPrice(selectedCompetition).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-left space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Next Steps</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Admin will verify your payment and documents within 1-2 business days</p>
              <p>• You will receive confirmation via your registered email</p>
              <p>• Monitor your registration status in your dashboard</p>
              {selectedCompetition.category !== "debate" && (
                <p>• Upload your competition work before the deadline if you haven't uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="justify-center flex flex-col gap-3">
        <Link href="/dashboard">
          <Button size="lg" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            View Registration Status
          </Button>
        </Link> 
        
        <Button variant="outline" onClick={downloadInvoice} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>
    </div>
  )
}