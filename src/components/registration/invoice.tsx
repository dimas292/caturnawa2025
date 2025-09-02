"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { CompetitionData } from "@/types/registration"

interface InvoiceProps {
  selectedCompetition: CompetitionData | null
  getCurrentPrice: (competition: CompetitionData) => number
  registrationId?: string
  teamName?: string
  members?: any[]
  onClose: () => void
}

export function Invoice({
  selectedCompetition,
  getCurrentPrice,
  registrationId,
  teamName,
  members,
  onClose
}: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const generateInvoice = () => {
    if (!invoiceRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedCompetition?.name}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .invoice-container {
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border: 1px solid #ddd;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.1;
              z-index: 1;
              pointer-events: none;
            }
            .watermark img {
              width: 400px;
              height: auto;
            }
            .content {
              position: relative;
              z-index: 2;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              color: #333;
              margin-bottom: 30px;
              text-align: center;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .detail-group h3 {
              color: #333;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .detail-label {
              color: #666;
              font-weight: 500;
            }
            .detail-value {
              color: #333;
              font-weight: 600;
            }
            .team-info {
              margin-bottom: 30px;
            }
            .team-info h3 {
              color: #333;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .member-item {
              background: #f9f9f9;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 5px;
            }
            .member-name {
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .member-details {
              color: #666;
              font-size: 14px;
            }
            .total-section {
              border-top: 2px solid #333;
              padding-top: 20px;
              text-align: right;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="watermark">
              <img src="/image/caturnawa/01.png" alt="Watermark" />
            </div>
            <div class="content">
              <div class="header">
                <div class="logo">UNAS FEST 2025</div>
                <div class="subtitle">Caturnawa Competition</div>
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
                    <span class="detail-value">${selectedCompetition?.name}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${selectedCompetition?.category}</span>
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
                <div class="detail-item">
                  <span class="detail-label">Team Size:</span>
                  <span class="detail-value">${members?.length || 1} member(s)</span>
                </div>
              </div>
              ` : ''}
              
              ${members && members.length > 0 ? `
              <div class="team-info">
                <h3>Team Members</h3>
                ${members.map((member, index) => `
                  <div class="member-item">
                    <div class="member-name">${member.role === 'LEADER' ? 'Team Leader' : `Member ${index + 1}`}</div>
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
                  <span class="detail-value">Rp ${getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value total-amount">Rp ${getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for participating in UNAS FEST 2025!</p>
                <p>For any questions, please contact our support team.</p>
                <p>Generated on ${new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
          
          <button class="print-button no-print" onclick="window.print()">
            🖨️ Print Invoice
          </button>
        </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
  }

  const downloadInvoice = () => {
    generateInvoice()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Invoice</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">UNAS FEST 2025 - Caturnawa</h3>
            <p className="text-muted-foreground">
              Invoice for {selectedCompetition?.name} registration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-3">Registration Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration ID:</span>
                  <span className="font-mono">#{registrationId || 'REG-' + Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Competition:</span>
                  <span>{selectedCompetition?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{selectedCompetition?.category}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Payment Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-orange-600 font-medium">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    Rp {getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {teamName && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Team Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Name:</span>
                  <span className="font-medium">{teamName}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">Team Size:</span>
                  <span className="font-medium">{members?.length || 1} member(s)</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                Rp {getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button onClick={downloadInvoice} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Generate & Download Invoice
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
