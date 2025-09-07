"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X, Loader2 } from "lucide-react"
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null) 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js')
        .then((module) => {
          console.log('html2pdf.js loaded successfully:', module.default)
          setHtml2pdfInstance(() => module.default)
        })
        .catch((err) => {
          console.error('Failed to load html2pdf.js:', err)
          setHtml2pdfInstance(null)
        })
    }
  }, [])

  const generateInvoice = async () => {
    console.log('generateInvoice called')
    console.log('html2pdfInstance available:', !!html2pdfInstance)
    console.log('invoiceRef.current available:', !!invoiceRef.current)
    
    setIsGenerating(true)

    try {
      if (html2pdfInstance && invoiceRef.current) {
        console.log('Attempting PDF generation...')
        const element = invoiceRef.current

        const opt = {
          margin: 0.3,
          filename: `invoice-${selectedCompetition?.shortName || 'competition'}-${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        }

        console.log('PDF options:', opt)
        
        const html2pdfWorker = html2pdfInstance()
        console.log('html2pdf worker created:', html2pdfWorker)
        
        await html2pdfWorker
          .set(opt)
          .from(element)
          .save()
          
        console.log('PDF generation completed')
          
      } else {
        console.log('html2pdf not available, using fallback print window')
        await generatePrintWindow()
      }
    } catch (err) {
      console.error('PDF generation failed:', err)
      await generatePrintWindow()
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePrintWindow = async () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      downloadHTMLFile()
      return
    }

    const invoiceHTML = generateInvoiceHTML()
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 100)
    }
  }

  const downloadHTMLFile = () => {
    const invoiceHTML = generateInvoiceHTML()
    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${selectedCompetition?.shortName || 'competition'}-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedCompetition?.name}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 10px; /* 📌 Diperkecil */
              background: white;
              color: black;
              font-size: 12px; /* 📌 Ukuran font default diperkecil */
            }
            .invoice-container {
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px; /* 📌 Diperkecil dari 40px */
              border: 1px solid #ddd;
              /* ❌ Hapus min-height: 100vh agar tidak memaksa tinggi halaman */
            }
            .content {
              position: relative;
              z-index: 2;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px; /* 📌 Diperkecil */
              margin-bottom: 20px; /* 📌 Diperkecil */
            }
            .header img {
              height: 60px; /* 📌 Diperkecil dari 80px */
              margin-bottom: 10px; /* 📌 Diperkecil */
            }
            .logo {
              font-size: 20px; /* 📌 Diperkecil */
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .subtitle {
              color: #666;
              font-size: 14px; /* 📌 Diperkecil */
            }
            .invoice-title {
              font-size: 24px; /* 📌 Diperkecil dari 28px */
              font-weight: bold;
              color: #333;
              margin-bottom: 20px; /* 📌 Diperkecil */
              text-align: center;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px; /* 📌 Diperkecil dari 30px */
              margin-bottom: 20px; /* 📌 Diperkecil */
            }
            .detail-group h3 {
              color: #333;
              margin-bottom: 10px; /* 📌 Diperkecil */
              font-size: 16px; /* 📌 Diperkecil */
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px; /* 📌 Diperkecil */
              padding: 3px 0; /* 📌 Diperkecil */
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
              margin-bottom: 20px; /* 📌 Diperkecil dari 30px */
            }
            .team-info h3 {
              color: #333;
              margin-bottom: 10px; /* 📌 Diperkecil */
              font-size: 16px; /* 📌 Diperkecil */
            }
            .member-item {
              background: #f9f9f9;
              padding: 10px; /* 📌 Diperkecil */
              margin-bottom: 8px; /* 📌 Diperkecil */
              border-radius: 4px; /* 📌 Diperkecil */
              font-size: 12px; /* 📌 Diperkecil */
            }
            .member-name {
              font-weight: bold;
              color: #333;
              margin-bottom: 3px; /* 📌 Diperkecil */
              font-size: 13px; /* 📌 Diperkecil */
            }
            .member-details {
              color: #666;
              font-size: 12px;
            }
            .total-section {
              border-top: 2px solid #333;
              padding-top: 15px; /* 📌 Diperkecil */
              text-align: right;
            }
            .total-amount {
              font-size: 20px; /* 📌 Diperkecil dari 24px */
              font-weight: bold;
              color: #333;
            }
            .footer {
              margin-top: 20px; /* 📌 Diperkecil dari 40px */
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 15px; /* 📌 Diperkecil */
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
              z-index: 1000;
            }
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <img 
              src="/image/caturnawa/01.png" 
              alt="" 
              class="watermark-image"
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
                opacity: 0.05;
                object-fit: contain;
                transform: rotate(-25deg);
                transform-origin: center;
              "
            />
            
            <div class="content">
              <div class="header">
                <img src="/image/caturnawa/01.png" alt="UNAS FEST 2025 Logo" />
                <div class="logo">UNAS FEST 2025</div>
                <div class="subtitle">Caturnawa</div>
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
          
          <script>
            window.focus();
          </script>
        </body>
      </html>
    `
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

        <div className="flex gap-2 p-6 border-t bg-gray-50">
          <Button onClick={generateInvoice} className="flex-1" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {html2pdfInstance ? 'Download PDF' : 'Print Invoice'}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generatePrintWindow()}
            disabled={isGenerating}
            size="sm"
          >
            Print Only
          </Button>
          <Button 
            variant="outline" 
            onClick={() => downloadHTMLFile()}
            disabled={isGenerating}
            size="sm"
          >
            Save HTML
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Hidden Invoice for PDF Generation */}
      <div ref={invoiceRef} className="hidden">
        <div className="invoice-container" style={{ 
          position: 'relative', 
          maxWidth: '800px', 
          margin: '0 auto', 
          background: 'white', 
          padding: '20px', // 📌 Diperkecil
          border: '1px solid #ddd', 
          fontFamily: 'Arial, sans-serif',
          // ❌ Hapus min-height: 100vh
        }}>
          {/* WATERMARK */}
          <img 
            src="/image/caturnawa/01.png" 
            alt="" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.05,
              objectFit: 'contain',
              transform: 'rotate(-25deg)',
              transformOrigin: 'center',
            }}
          />

          <div className="content" style={{ position: 'relative', zIndex: 2 }}>
            <div className="header" style={{ 
              textAlign: 'center', 
              borderBottom: '2px solid #333', 
              paddingBottom: '15px', // 
              marginBottom: '20px' // 
            }}>
              <img 
                src="/image/caturnawa/01.png" 
                alt="UNAS FEST 2025 Logo" 
                style={{ height: '60px', marginBottom: '10px' }} // 
              />
              <div className="logo" style={{ 
                fontSize: '20px', //
                fontWeight: 'bold', 
                color: '#333', 
                marginBottom: '5px' 
              }}>
                UNAS FEST 2025
              </div>
              <div className="subtitle" style={{ 
                color: '#666', 
                fontSize: '14px' // 
              }}>
                Caturnawa Competition
              </div>
            </div>

            <div className="invoice-title" style={{ 
              fontSize: '24px', // 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '20px', // 
              textAlign: 'center' 
            }}>
              INVOICE
            </div>

            <div className="invoice-details" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px', // 
              marginBottom: '20px' //
            }}>
              <div className="detail-group">
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '10px', //
                  fontSize: '16px' // 
                }}>Registration Details</h3>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', // 
                  padding: '3px 0' // 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Invoice Date:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Registration ID:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>#{registrationId || 'REG-' + Date.now().toString().slice(-6)}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Competition:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{selectedCompetition?.name}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Category:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{selectedCompetition?.category}</span>
                </div>
              </div>

              <div className="detail-group">
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '10px', 
                  fontSize: '16px' 
                }}>Payment Information</h3>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Payment Status:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>Pending</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Payment Method:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>Bank Transfer</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Due Date:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            {teamName && (
              <div className="team-info" style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '10px', 
                  fontSize: '16px' 
                }}>Team Information</h3>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Team Name:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{teamName}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px', 
                  padding: '3px 0' 
                }}>
                  <span className="detail-label" style={{ 
                    color: '#666', 
                    fontWeight: 500 
                  }}>Team Size:</span>
                  <span className="detail-value" style={{ 
                    color: '#333', 
                    fontWeight: 600 
                  }}>{members?.length || 1} member(s)</span>
                </div>
              </div>
            )}

            {members && members.length > 0 && (
              <div className="team-info" style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '10px', 
                  fontSize: '16px' 
                }}>Team Members</h3>
                {members.map((member, index) => (
                  <div key={index} className="member-item" style={{ 
                    background: '#f9f9f9', 
                    padding: '10px', // 
                    marginBottom: '8px', //
                    borderRadius: '4px', // 
                    fontSize: '12px' // 
                  }}>
                    <div className="member-name" style={{ 
                      fontWeight: 'bold', 
                      color: '#333', 
                      marginBottom: '3px', // 
                      fontSize: '13px' // 
                    }}>
                      {member.role === 'LEADER' ? 'Member 1' : `Member ${index + 1}`}
                    </div>
                    <div className="member-details" style={{ 
                      color: '#666', 
                      fontSize: '12px' 
                    }}>
                      <div>Name: {member.fullName}</div>
                      <div>Email: {member.email}</div>
                      <div>Institution: {member.institution}</div>
                      <div>Student ID: {member.studentId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="total-section" style={{ 
              borderTop: '2px solid #333', 
              paddingTop: '15px', // 
              textAlign: 'right' 
            }}>
              <div className="detail-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '6px', 
                padding: '3px 0' 
              }}>
                <span className="detail-label" style={{ 
                  color: '#666', 
                  fontWeight: 500 
                }}>Registration Fee:</span>
                <span className="detail-value" style={{ 
                  color: '#333', 
                  fontWeight: 600 
                }}>Rp {getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}</span>
              </div>
              <div className="detail-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '6px', 
                padding: '3px 0' 
              }}>
                <span className="detail-label" style={{ 
                  color: '#666', 
                  fontWeight: 500 
                }}>Total Amount:</span>
                <span className="detail-value total-amount" style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold', 
                  color: '#333' 
                }}>Rp {getCurrentPrice(selectedCompetition!).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="footer" style={{ 
              marginTop: '20px', //
              textAlign: 'center', 
              color: '#666', 
              fontSize: '12px', 
              borderTop: '1px solid #ddd', 
              paddingTop: '15px' //
            }}>
              <p>Thank you for participating in UNAS FEST 2025!</p>
              <p>For any questions, please contact our support team.</p>
              <p>Generated on {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}