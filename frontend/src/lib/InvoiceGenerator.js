import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (transactionData) => {
    const doc = new jsPDF();
    const {
        customerName,
        customerAddress,
        customerGstin,
        customerPhone,
        items,
        totals,
        paymentMethod,
        paymentStatus,
        date,
        invoiceId
    } = transactionData;

    // -- COMPANY HEADER --
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("SHIVAM YARN AGENCIES", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("All Kind of Filament Yarn Supplier", 105, 26, { align: "center" });
    doc.text("123, Textile Market Road, Tirupur - 641604", 105, 31, { align: "center" });
    doc.text("Phone: +91 98765 43210 | Email: support@shivamyarn.com", 105, 36, { align: "center" });
    doc.text("GSTIN: 33AAAAA0000A1Z5", 105, 41, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(10, 45, 200, 45);

    // -- INVOICE DETAILS --
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 15, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Left Side: Bill To
    doc.text("Bill To:", 15, 62);
    doc.setFont("helvetica", "bold");
    doc.text(customerName || "Cash Customer", 15, 67);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(customerAddress || "N/A", 80);
    doc.text(addressLines, 15, 72);
    doc.text(`GSTIN: ${customerGstin || "N/A"}`, 15, 72 + (addressLines.length * 5));
    doc.text(`Phone: ${customerPhone || "N/A"}`, 15, 77 + (addressLines.length * 5));

    // Right Side: Invoice Info
    const rightColX = 130;
    doc.text(`Invoice No:`, rightColX, 62);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceId || `INV-${Date.now()}`, rightColX + 25, 62);
    doc.setFont("helvetica", "normal");

    doc.text(`Date:`, rightColX, 67);
    doc.text(new Date(date || Date.now()).toLocaleDateString('en-IN'), rightColX + 25, 67);

    doc.text(`Payment:`, rightColX, 72);
    doc.text(paymentMethod ? paymentMethod.toUpperCase() : "CASH", rightColX + 25, 72);

    // -- ITEM TABLE --
    const tableStartY = 95;
    const tableData = items.map((item, index) => [
        index + 1,
        item.productName || "Yarn Product",
        `${item.quantity} kg`,
        `₹${item.ratePerKg}`,
        `${item.gstRate}%`,
        `₹${((item.quantity * item.ratePerKg)).toLocaleString()}`
    ]);

    doc.autoTable({
        startY: tableStartY,
        head: [['#', 'Item Description', 'Qty', 'Rate', 'GST', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            5: { halign: 'right' }
        }
    });

    // -- TOTALS --
    let finalY = doc.lastAutoTable.finalY + 10;
    const totalsX = 140;

    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, finalY);
    doc.text(`₹${totals.subtotal.toLocaleString()}`, 190, finalY, { align: "right" });

    doc.text("IGST:", totalsX, finalY + 5);
    doc.text(`₹${totals.gst.toLocaleString()}`, 190, finalY + 5, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", totalsX, finalY + 12);
    doc.text(`₹${totals.total.toLocaleString()}`, 190, finalY + 12, { align: "right" });

    // -- FOOTER --
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 190, pageHeight - 30, { align: "right" });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Terms & Conditions: Goods once sold will not be taken back. Subject to Tirupur Jurisdiction.", 105, pageHeight - 10, { align: "center" });

    // Save the PDF
    doc.save(`Invoice_${customerName || 'Cash'}_${Date.now()}.pdf`);
};
