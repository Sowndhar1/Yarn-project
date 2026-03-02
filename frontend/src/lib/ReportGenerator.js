import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Company Details
const COMPANY_DETAILS = {
    name: "SHIVAM YARN AGENCIES",
    address: "86/64A J.G NAGAR 2ND STREET, Tirupur-641602, Tamil Nadu",
    gstin: "33AAVFS1234A1Z5",
    phone: "9025747946",
    email: "sowndharsv2006@gmail.com"
};

// Formatting utilities
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount).replace('₹', 'Rs. ');
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
};

/**
 * Generates a detailed GST Invoice for a specific sale
 * @param {Object} sale - The sale object from API
 */
export const generateInvoicePDF = (sale) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header Section
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("TAX INVOICE", pageWidth / 2, 15, { align: 'center' });

    // Company Info (Left)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_DETAILS.name, 15, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const addressLines = doc.splitTextToSize(COMPANY_DETAILS.address, 90);
    doc.text(addressLines, 15, 30);
    const addrHeight = addressLines.length * 4;
    doc.text(`GSTIN: ${COMPANY_DETAILS.gstin}`, 15, 30 + addrHeight + 2);
    doc.text(`Mobile: ${COMPANY_DETAILS.phone}`, 15, 30 + addrHeight + 6);

    // Invoice Details (Right)
    const rightColX = pageWidth - 80;
    let currentY = 30;

    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${sale.invoiceNumber}`, rightColX, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formatDate(sale.saleDate)}`, rightColX, currentY);
    currentY += 5;

    doc.text(`Reference: ${sale.referenceNumber || '-'}`, rightColX, currentY);

    // Buyer Details
    const dividerY = Math.max(30 + addrHeight + 12, currentY + 10);
    doc.setLineWidth(0.5);
    doc.line(15, dividerY, pageWidth - 15, dividerY);

    const buyerY = dividerY + 5;
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, buyerY + 5);
    doc.setFont("helvetica", "normal");
    doc.text(sale.customerName, 15, buyerY + 10);

    if (sale.customerAddress) {
        const custAddr = doc.splitTextToSize(sale.customerAddress, 100);
        doc.text(custAddr, 15, buyerY + 15);
    }
    if (sale.customerGstin) {
        const gstinY = sale.customerAddress ? (buyerY + 15 + (doc.splitTextToSize(sale.customerAddress, 100).length * 4) + 2) : buyerY + 15;
        doc.text(`GSTIN: ${sale.customerGstin}`, 15, gstinY);
    }

    // Items Table
    const tableStartY = buyerY + 30; // approx

    // Prepare table logic
    const tableBody = sale.items.map((item, index) => [
        index + 1,
        item.product?.name || "Yarn Product",
        "5205", // Default HSN for Yarn
        item.quantity + " KG",
        formatCurrency(item.ratePerKg),
        formatCurrency(item.taxableAmount)
    ]);

    doc.autoTable = null; // Ensure no conflicts
    autoTable(doc, {
        startY: tableStartY,
        head: [['S.No', 'Product Description', 'HSN/SAC', 'Qty', 'Rate', 'Amount']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 70 }, // Description
            5: { halign: 'right' } // Amount
        },
        didDrawPage: (data) => {
            // Footer on each page if needed
        }
    });

    let finalY = doc.lastAutoTable.finalY + 5;

    // Totals Section (Right Aligned)
    const summaryX = pageWidth - 80;
    const valueX = pageWidth - 15;

    doc.text("Taxable Value:", summaryX, finalY + 5);
    doc.text(formatCurrency(sale.subtotal), valueX, finalY + 5, { align: 'right' });

    // Tax Calculation (Assuming Local Sale: CGST + SGST)
    const cgst = sale.totalGst / 2;
    const sgst = sale.totalGst / 2;

    doc.text("CGST (2.5%):", summaryX, finalY + 10);
    doc.text(formatCurrency(cgst), valueX, finalY + 10, { align: 'right' });

    doc.text("SGST (2.5%):", summaryX, finalY + 15);
    doc.text(formatCurrency(sgst), valueX, finalY + 15, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Grand Total:", summaryX, finalY + 25);
    doc.text(formatCurrency(sale.grandTotal), valueX, finalY + 25, { align: 'right' });

    // Amount in words (Basic impl, ideally generic function)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Amount in words: ${convertNumberToWords(Math.round(sale.grandTotal))} Rupees Only`, 15, finalY + 35);

    // Footer / Terms
    const footerY = finalY + 50; // Ensure logic handles page break if needed, simplistic here

    doc.setFontSize(8);
    doc.text("Terms & Conditions:", 15, footerY);
    doc.text("1. Goods once sold will not be taken back.", 15, footerY + 5);
    doc.text("2. Subject to Tirupur Jurisdiction only.", 15, footerY + 9);
    doc.text("3. Interest @ 24% p.a. will be charged for delayed payment.", 15, footerY + 13);

    // Auth Signatory
    doc.text("For SHIVAM YARN AGENCIES", pageWidth - 15, footerY, { align: 'right' });
    doc.text("(Authorized Signatory)", pageWidth - 15, footerY + 20, { align: 'right' });

    // Generate Filename and Save
    doc.save(`Invoice_${sale.invoiceNumber}.pdf`);
};

/**
 * Generates summary report for sales
 */
export const generateSalesReport = (sales, startDate, endDate) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Sales Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);

    // Aggregates
    const totalRev = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    doc.text(`Total Revenue: ${formatCurrency(totalRev)}`, 14, 30);
    doc.text(`Total Orders: ${sales.length}`, 80, 30);

    const tableBody = sales.map(s => [
        formatDate(s.saleDate),
        s.invoiceNumber,
        s.customerName,
        formatCurrency(s.grandTotal)
    ]);

    autoTable(doc, {
        startY: 35,
        head: [['Date', 'Invoice', 'Customer', 'Amount']],
        body: tableBody,
        theme: 'striped'
    });

    doc.save(`Sales_Report_${startDate}_${endDate}.pdf`);
};

export const generatePurchaseReport = (purchases, startDate, endDate) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Purchase Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);

    const totalExp = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    doc.text(`Total Expenditure: ${formatCurrency(totalExp)}`, 14, 30);

    const tableBody = purchases.map(p => [
        formatDate(p.purchaseDate),
        p.invoiceNumber || '-',
        p.supplierName,
        formatCurrency(p.totalAmount)
    ]);

    autoTable(doc, {
        startY: 35,
        head: [['Date', 'Invoice', 'Supplier', 'Amount']],
        body: tableBody,
        theme: 'striped'
    });

    doc.save(`Purchase_Report_${startDate}_${endDate}.pdf`);
};

// Helper: Number to Words (Simplified)
function convertNumberToWords(amount) {
    // Basic placeholder. 
    // In real app, import 'number-to-words' library or write full recursive function
    return amount + "";
}
