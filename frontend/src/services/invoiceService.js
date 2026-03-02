import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a PDF invoice for an order
 * @param {Object} order - Full order object from backend
 */
export const generateInvoice = (order) => {
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.setFont('helvetica', 'bold');
    doc.text('SHIVAM YARN AGENCIES', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Quality Filament Yarn Supplier', pageWidth / 2, 26, { align: 'center' });
    doc.text('Contact: +91 90257 47946 | E-mail: sowndharsv2006@gmail.com', pageWidth / 2, 31, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(15, 38, pageWidth - 15, 38);

    // -- Order Info --
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE / ORDER SUMMARY', 15, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Number: #${order.orderNumber}`, 15, 58);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 15, 63);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 15, 68);
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 15, 73);

    // -- Billing / Shipping --
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth - 80, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customer?.name || 'Customer', pageWidth - 80, 63);

    const address = order.shippingAddress;
    const addrLines = [
        address.street,
        `${address.city}, ${address.state} - ${address.postalCode}`,
        address.country
    ];
    let y = 68;
    addrLines.forEach(line => {
        if (line) {
            doc.text(line, pageWidth - 80, y);
            y += 5;
        }
    });

    // -- Items Table --
    const tableData = order.items.map(item => {
        const name = item.productSnapshot?.name || item.product?.name || 'Yarn Product';
        const price = item.price || item.product?.pricePerKg || 0;
        const total = price * item.quantity;

        return [
            name,
            `${item.quantity} kg`,
            `Rs. ${price.toLocaleString()}`,
            `Rs. ${total.toLocaleString()}`
        ];
    });

    autoTable(doc, {
        startY: 95,
        head: [['Product Description', 'Quantity', 'Rate (per Kg)', 'Total Amount']],
        body: tableData,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        theme: 'striped',
        margin: { left: 15, right: 15 }
    });

    // -- Summary --
    let finalY = doc.lastAutoTable.finalY + 15;
    const summaryLabelX = pageWidth - 85;
    const summaryValueX = pageWidth - 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);

    const drawSummaryRow = (label, value, isBold = false) => {
        if (isBold) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.setFontSize(12);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.setFontSize(10);
        }
        doc.text(label, summaryLabelX, finalY);
        doc.text(`Rs. ${value.toLocaleString()}`, summaryValueX, finalY, { align: 'right' });
        finalY += isBold ? 10 : 7;
    };

    drawSummaryRow('Subtotal:', order.subtotal);
    drawSummaryRow('GST (18%):', order.gstAmount);
    drawSummaryRow('Delivery Fee:', order.shippingCost);

    doc.setDrawColor(230);
    doc.line(summaryLabelX, finalY - 2, summaryValueX, finalY - 2);
    finalY += 3;

    drawSummaryRow('Grand Total:', order.totalAmount, true);

    // -- Footer --
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('Thank you for choosing Shivam Yarn Agencies!', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text('This is a computer-generated invoice.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`Invoice_${order.orderNumber}.pdf`);
};
