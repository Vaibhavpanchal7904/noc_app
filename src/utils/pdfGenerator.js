// =====================================================================
// PDF Generation Utility using jsPDF & autotable
// =====================================================================

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Format Indian Currency INR (e.g. ₹ 1,04,960.00)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Generates an Official NOC Approval Letter PDF
 */
export const generateApprovalLetterPdf = (request, letter, institute, agency, organization, letterSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const orgCode = organization?.code || 'CVM';
  const isCvmu = orgCode === 'CVMU';

  // 1. Header & Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);

  const mainHeader = isCvmu ? letterSettings.headerCvmuTitle : letterSettings.headerCvmTitle;
  const subHeader = isCvmu ? letterSettings.headerCvmuSubtitle : letterSettings.headerCvmSubtitle;

  doc.text(mainHeader, pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(subHeader, pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(letterSettings.nocDeptTitle, pageWidth / 2, 32, { align: 'center' });

  // Dividing Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 36, pageWidth - 15, 36);

  // 2. Reference & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Ref No: ${letter.letter_no}`, 15, 45);
  doc.text(`Date: ${formatDate(letter.letter_date)}`, pageWidth - 15, 45, { align: 'right' });

  // 3. Addressee
  doc.setFont('helvetica', 'normal');
  doc.text('To,', 15, 54);
  doc.setFont('helvetica', 'bold');
  doc.text(`The Principal / Head of Department`, 15, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`${institute?.name || 'Respective Institute'}`, 15, 65);
  doc.text(`Vallabh Vidyanagar, Gujarat`, 15, 70);

  // 4. Subject
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const subjectText = `Subject: Approval / Sanction Order for ${request.title}`;
  const splitSubject = doc.splitTextToSize(subjectText, pageWidth - 30);
  doc.text(splitSubject, 15, 80);

  // 5. Reference Numbers Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const refText = `Reference: (1) College Outward No: ${request.clg_out_no || 'N/A'} (2) NOC Inward No: ${request.clg_in_no || 'N/A'} (3) NOC File Ref: ${request.request_no}`;
  doc.text(refText, 15, 90);

  // 6. Body Paragraph
  const approvedApproval = request.approvals?.find(a => a.decision === 'Approved') || request.approvals?.[0];
  const approvedAmt = approvedApproval?.approved_amount || approvedApproval?.proposed_amount || 0;

  const bodyPara = `With reference to the requirement submitted by your institute, we are pleased to inform you that the competent authority (${approvedApproval?.authority_id ? 'Authorized Authority' : 'Chairman / Registrar'}) has sanctioned the procurement / service work as detailed below with the approved agency:`;
  const splitBody = doc.splitTextToSize(bodyPara, pageWidth - 30);
  doc.text(splitBody, 15, 98);

  // 7. Summary Table
  const tableData = (request.items || []).map((it, idx) => [
    idx + 1,
    it.item_name,
    it.specifications || 'As per approved quotation',
    it.quantity + ' ' + (it.unit || 'Nos'),
    agency?.name || 'Selected Vendor',
    formatCurrency(approvedAmt)
  ]);

  doc.autoTable({
    startY: 112,
    head: [['#', 'Item / Work Description', 'Specifications', 'Qty', 'Sanctioned Vendor', 'Approved Total']],
    body: tableData.length > 0 ? tableData : [[1, request.title, request.description || '-', '1 Lot', agency?.name || 'Vendor', formatCurrency(approvedAmt)]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // 8. Terms & Conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Terms & Instructions:', 15, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const terms = [
    '1. The work/procurement must strictly comply with the approved specifications and rates.',
    '2. Installation & commissioning verification certificate must be signed by the department engineer/head.',
    '3. Official tax invoice along with delivery challan should be submitted to NOC for bill approval.'
  ];
  terms.forEach((term, idx) => {
    doc.text(term, 18, finalY + 6 + (idx * 5));
  });

  // 9. Signatures Block
  const signY = finalY + 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('For, Charutar Vidya Mandal / NOC Cell', 15, signY);
  doc.text('Authorized Signatory', pageWidth - 15, signY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(letter.signatory_name || 'Authorized Signatory', pageWidth - 15, signY + 14, { align: 'right' });
  doc.text(letter.signatory_title || 'Hon. Joint Secretary', pageWidth - 15, signY + 19, { align: 'right' });

  // 10. Footer Note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(letterSettings.footerNote, pageWidth / 2, 285, { align: 'center' });

  return doc;
};

/**
 * Generates Quotation Comparison Sheet PDF
 */
export const generateQuotationComparisonPdf = (request, institutes, agencies) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const inst = institutes.find(i => i.id === request.institute_id);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('NOC DEPARTMENT - QUOTATION COMPARISON STATEMENT', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Request No: ${request.request_no} | Institute: ${inst?.name || 'N/A'} | Date: ${formatDate(request.request_date)}`, 14, 23);
  doc.text(`Requirement Title: ${request.title}`, 14, 29);

  const tableHeaders = ['Agency Name', 'Quotation Ref', 'Date', 'Subtotal (INR)', 'GST/Tax', 'Total Amount', 'Delivery', 'Selected Rationale'];
  const tableRows = (request.quotations || []).map(q => {
    const ag = agencies.find(a => a.id === q.agency_id);
    return [
      ag?.name || 'Vendor',
      q.quotation_no || 'N/A',
      formatDate(q.quotation_date),
      formatCurrency(q.subtotal_amount),
      `${q.tax_percent}% (${formatCurrency(q.tax_amount)})`,
      formatCurrency(q.total_amount),
      q.delivery_timeline || '-',
      q.is_selected ? `SELECTED: ${q.selection_rationale || 'Lowest/Compliant'}` : '-'
    ];
  });

  doc.autoTable({
    startY: 35,
    head: [tableHeaders],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 }
  });

  return doc;
};

/**
 * Combines an array of image data URLs into a multi-page PDF
 */
export const combineImagesToPdf = async (imageDataUrls, title = 'Scanned Document') => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageDataUrls.length; i++) {
    if (i > 0) doc.addPage();
    const imgData = imageDataUrls[i];
    doc.addImage(imgData, 'JPEG', 10, 10, pageWidth - 20, pageHeight - 20, undefined, 'FAST');
  }

  return doc;
};
