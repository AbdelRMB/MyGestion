import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles pour le PDF de devis
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
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  
  companyDetails: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  
  quoteInfo: {
    textAlign: 'right',
  },
  
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  
  quoteNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  
  quoteDates: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  
  // Informations client
  clientSection: {
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  clientInfo: {
    fontSize: 11,
    color: '#1f2937',
    lineHeight: 1.4,
  },
  
  clientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  // Tableau des articles
  table: {
    marginBottom: 30,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
  },
  
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 30,
  },
  
  tableCell: {
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'left',
  },
  
  tableCellRight: {
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'right',
  },
  
  tableCellCenter: {
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Largeurs des colonnes
  colDescription: { flex: 4 },
  colQuantity: { flex: 1 },
  colUnitPrice: { flex: 1.5 },
  colTotal: { flex: 1.5 },
  
  // Totaux
  totalsSection: {
    marginLeft: 'auto',
    width: '40%',
    marginBottom: 30,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  
  totalLabel: {
    fontSize: 11,
    color: '#374151',
  },
  
  totalValue: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1f2937',
    marginTop: 5,
  },
  
  grandTotalLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  grandTotalValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Notes et conditions
  notesSection: {
    marginBottom: 30,
  },
  
  notesText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  
  // Conditions générales
  conditionsSection: {
    marginBottom: 20,
  },
  
  conditionsList: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
    marginLeft: 10,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 50,
    fontSize: 8,
    color: '#9ca3af',
  }
});

// Fonction helper pour formater les montants
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};

// Fonction helper pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const QuotePDF = ({ quote }) => {
  if (!quote) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>MyGestion</Text>
            <Text style={styles.companyDetails}>
              Votre entreprise{'\n'}
              123 Rue de l'Innovation{'\n'}
              75001 Paris, France{'\n'}
              Tél: +33 1 23 45 67 89{'\n'}
              Email: contact@mygestion.fr
            </Text>
          </View>
          
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteTitle}>DEVIS</Text>
            <Text style={styles.quoteNumber}>N° {quote.number}</Text>
            <Text style={styles.quoteDates}>
              Date: {formatDate(quote.createdAt)}
            </Text>
            <Text style={styles.quoteDates}>
              Valide jusqu'au: {formatDate(quote.validUntil)}
            </Text>
          </View>
        </View>

        {/* Informations client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>CLIENT</Text>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{quote.client}</Text>
            {quote.clientEmail && <Text>{quote.clientEmail}</Text>}
            {quote.clientPhone && <Text>{quote.clientPhone}</Text>}
            {quote.clientAddress && (
              <Text style={{ marginTop: 4 }}>
                {quote.clientAddress.split('\n').join('\n')}
              </Text>
            )}
          </View>
        </View>

        {/* Objet du devis */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>OBJET</Text>
          <Text style={styles.clientInfo}>{quote.title}</Text>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>DÉTAIL DES PRESTATIONS</Text>
          
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
              Qté
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>
              Prix unit. (€)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>
              Total (€)
            </Text>
          </View>

          {/* Lignes du tableau */}
          {quote.items && quote.items.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCellCenter, styles.colQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCellRight, styles.colUnitPrice]}>
                {formatCurrency(item.unitPrice).replace('€', '').trim()}
              </Text>
              <Text style={[styles.tableCellRight, styles.colTotal]}>
                {formatCurrency(item.total).replace('€', '').trim()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}
          
          {quote.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA:</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.tax)}</Text>
            </View>
          )}
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL TTC:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Conditions générales */}
        <View style={styles.conditionsSection}>
          <Text style={styles.sectionTitle}>CONDITIONS GÉNÉRALES</Text>
          <Text style={styles.conditionsList}>
            • Devis valable {Math.ceil((new Date(quote.validUntil) - new Date(quote.createdAt)) / (1000 * 60 * 60 * 24))} jours à compter de la date d'émission{'\n'}
            • Règlement à 30 jours par virement bancaire{'\n'}
            • Acompte de 30% à la commande{'\n'}
            • Les prix sont exprimés en euros, hors taxes{'\n'}
            • Toute commande implique l'acceptation de nos conditions générales de vente
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          MyGestion - Devis N°{quote.number} - Généré le {formatDate(new Date())}
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export default QuotePDF;