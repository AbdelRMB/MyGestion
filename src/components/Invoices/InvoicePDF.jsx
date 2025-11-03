import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles pour le PDF de facture
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  
  companyDetails: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    textAlign: 'right',
    marginBottom: 10,
  },
  
  invoiceNumber: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  
  // Informations facture et client
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  
  infoBlock: {
    flex: 1,
    marginRight: 20,
  },
  
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  infoContent: {
    fontSize: 11,
    color: '#1F2937',
    lineHeight: 1.4,
  },
  
  // Statut
  statusContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  
  statusText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  
  // Tableau des articles
  table: {
    marginBottom: 30,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 35,
  },
  
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 35,
  },
  
  // Colonnes du tableau
  descriptionColumn: {
    flex: 4,
    paddingRight: 10,
  },
  
  quantityColumn: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  
  priceColumn: {
    flex: 1.5,
    textAlign: 'right',
    paddingLeft: 10,
  },
  
  totalColumn: {
    flex: 1.5,
    textAlign: 'right',
    paddingLeft: 10,
  },
  
  tableHeaderText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  
  tableCellText: {
    fontSize: 10,
    color: '#1F2937',
  },
  
  tableCellBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  
  // Section totaux
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  
  totalsContainer: {
    width: 200,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 5,
  },
  
  totalLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  
  totalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  
  totalLabelFinal: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  
  totalValueFinal: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
  },
  
  // Informations de paiement
  paymentInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 5,
  },
  
  paymentTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 5,
  },
  
  paymentText: {
    fontSize: 10,
    color: '#166534',
  },
  
  // Notes et conditions
  notesSection: {
    marginBottom: 30,
  },
  
  notesTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  
  notesText: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  
  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  
  // Numérotation des pages
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9CA3AF',
  },
});

const InvoicePDF = ({ invoice }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusInfo = (status, isOverdue) => {
    if (isOverdue) {
      return { label: 'EN RETARD', color: '#DC2626' };
    }
    
    const statusMap = {
      draft: { label: 'BROUILLON', color: '#6B7280' },
      sent: { label: 'ENVOYÉE', color: '#2563EB' },
      paid: { label: 'PAYÉE', color: '#059669' },
      overdue: { label: 'EN RETARD', color: '#DC2626' },
      cancelled: { label: 'ANNULÉE', color: '#EA580C' }
    };
    
    return statusMap[status] || statusMap.draft;
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && dueDate < today;
  };

  const statusInfo = getStatusInfo(invoice.status, isOverdue());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>MyGestion</Text>
            <Text style={styles.companyDetails}>
              Votre entreprise{'\n'}
              Adresse de l'entreprise{'\n'}
              Code postal Ville{'\n'}
              Téléphone: +33 X XX XX XX XX{'\n'}
              Email: contact@monentreprise.fr
            </Text>
          </View>
          
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { borderColor: statusInfo.color, backgroundColor: `${statusInfo.color}20` }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informations facture et client */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Facturé à</Text>
            <Text style={styles.infoContent}>
              {invoice.client}{'\n'}
              {invoice.clientAddress || ''}{'\n'}
              {invoice.clientPhone ? `Tél: ${invoice.clientPhone}\n` : ''}
              {invoice.clientEmail ? `Email: ${invoice.clientEmail}` : ''}
            </Text>
          </View>
          
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Détails de la facture</Text>
            <Text style={styles.infoContent}>
              Date d'émission: {formatDate(invoice.issueDate)}{'\n'}
              Date d'échéance: {formatDate(invoice.dueDate)}{'\n'}
              Conditions: {invoice.paymentTerms} jours{'\n'}
              {invoice.quoteId ? `Devis source: Oui` : ''}
            </Text>
          </View>
        </View>

        {/* Informations de paiement si payée */}
        {invoice.status === 'paid' && invoice.paymentDate && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>✓ FACTURE PAYÉE</Text>
            <Text style={styles.paymentText}>
              Montant payé: {formatCurrency(invoice.paidAmount)} le {formatDate(invoice.paymentDate)}
            </Text>
          </View>
        )}

        {/* Tableau des articles */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderText, styles.quantityColumn]}>
              QTÉ
            </Text>
            <Text style={[styles.tableHeaderText, styles.priceColumn]}>
              PRIX UNIT.
            </Text>
            <Text style={[styles.tableHeaderText, styles.totalColumn]}>
              TOTAL
            </Text>
          </View>

          {/* Lignes du tableau */}
          {invoice.items && invoice.items.map((item, index) => (
            <View 
              key={index} 
              style={index === invoice.items.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              <Text style={[styles.tableCellText, styles.descriptionColumn]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCellText, styles.quantityColumn]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCellText, styles.priceColumn]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCellBold, styles.totalColumn]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Section des totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            
            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Remise:</Text>
                <Text style={[styles.totalValue, { color: '#DC2626' }]}>
                  -{formatCurrency(invoice.discount)}
                </Text>
              </View>
            )}
            
            {invoice.tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
              </View>
            )}
            
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>TOTAL:</Text>
              <Text style={styles.totalValueFinal}>{formatCurrency(invoice.total)}</Text>
            </View>

            {invoice.paidAmount > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Montant payé:</Text>
                  <Text style={[styles.totalValue, { color: '#059669' }]}>
                    -{formatCurrency(invoice.paidAmount)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabelFinal}>Solde restant:</Text>
                  <Text style={styles.totalValueFinal}>
                    {formatCurrency(invoice.total - invoice.paidAmount)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Conditions de paiement */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Conditions de paiement:</Text>
          <Text style={styles.notesText}>
            Paiement à réception de facture sous {invoice.paymentTerms} jours.{'\n'}
            En cas de retard de paiement, des pénalités pourront être appliquées.{'\n'}
            Tout règlement effectué par chèque ne sera libératoire qu'après encaissement.
          </Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>
            MyGestion - Facture générée automatiquement le {formatDate(new Date().toISOString())}
          </Text>
        </View>

        {/* Numérotation des pages */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export default InvoicePDF;