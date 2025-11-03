import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// Styles pour le PDF du cahier des charges
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  
  // En-tête du document
  header: {
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#6B7280',
  },
  
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: 2,
  },
  
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  
  projectDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  
  documentDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 8,
  },

  // Table des matières
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 30,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#6B7280',
    letterSpacing: 1,
  },
  
  tocSection: {
    marginBottom: 20,
  },
  
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  
  tocItemLevel1: {
    backgroundColor: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  
  tocItemLevel2: {
    backgroundColor: '#FFFFFF',
    marginLeft: 20,
    fontSize: 11,
  },
  
  tocItemText: {
    flex: 1,
    marginRight: 20,
  },
  
  tocLink: {
    color: '#374151',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  
  tocLinkLevel2: {
    color: '#6B7280',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  
  tocDots: {
    flex: 2,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 8,
  },

  // Contenu principal
  contentSection: {
    marginTop: 30,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 30,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sectionNumber: {
    backgroundColor: '#1F2937',
    color: 'white',
    padding: 6,
    marginRight: 10,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#9CA3AF',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  
  subsectionNumber: {
    backgroundColor: '#4B5563',
    color: 'white',
    padding: 4,
    marginRight: 8,
    fontSize: 11,
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'center',
  },
  
  description: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#6B7280',
    lineHeight: 1.5,
  },
  
  subsectionDescription: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#9CA3AF',
    marginLeft: 15,
    lineHeight: 1.5,
  },
  
  bulletList: {
    marginLeft: 30,
    marginTop: 8,
    marginBottom: 12,
  },
  
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  
  bulletPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  
  bulletText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    lineHeight: 1.4,
  },
  
  bulletTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#64748B',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 40,
    fontSize: 9,
    color: '#64748B',
  }
});

// Fonction helper pour formater les dates
const formatDate = (date = new Date()) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const SpecificationPDF = ({ specification, features, generateTableOfContents, getChildren, levelList }) => {
  const tableOfContents = generateTableOfContents();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.documentTitle}>CAHIER DES CHARGES</Text>
          <Text style={styles.projectTitle}>{specification.title}</Text>
          {specification.description && (
            <Text style={styles.projectDescription}>{specification.description}</Text>
          )}
          <Text style={styles.documentDate}>
            Document généré le {formatDate()}
          </Text>
        </View>

        {/* Table des matières */}
        {tableOfContents.length > 0 && (
          <View style={styles.tocSection}>
            <Text style={styles.tocTitle}>TABLE DES MATIÈRES</Text>
            {tableOfContents.map((item, index) => (
              <View key={item.id}>
                {/* Niveau 1 */}
                <View style={[styles.tocItem, styles.tocItemLevel1]}>
                  <Link src={`#section-${item.id}`} style={[styles.tocItemText, styles.tocLink]}>
                    <Text>
                      {item.index}. {item.title}
                    </Text>
                  </Link>
                  <Text style={styles.tocDots}>
                    {item.children.length > 0 ? '························' : '- - - - - - - - - -'}
                  </Text>
                </View>
                
                {/* Niveau 2 */}
                {item.children.map((child) => (
                  <View key={child.id} style={[styles.tocItem, styles.tocItemLevel2]}>
                    <Link src={`#section-${child.id}`} style={[styles.tocItemText, styles.tocLinkLevel2]}>
                      <Text>
                        {child.index} {child.title}
                      </Text>
                    </Link>
                    <Text style={styles.tocDots}>- - - - - - - - -</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Message si pas de contenu */}
        {tableOfContents.length === 0 && (
          <View style={{ textAlign: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 14, color: '#64748B' }}>
              Aucune fonctionnalité définie pour ce cahier des charges.
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Ce document a été généré automatiquement par MyGestion
        </Text>
      </Page>

      {/* Page de contenu */}
      {tableOfContents.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Contenu continu */}
          {tableOfContents.map((item, sectionIndex) => (
            <View key={`content-${item.id}`}>
              {/* Section Niveau 1 */}
              <View style={styles.sectionTitle} id={`section-${item.id}`}>
                <Text style={styles.sectionNumber}>{item.index}</Text>
                <Text style={{ flex: 1 }}>{item.title}</Text>
              </View>
              
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}

              {/* Sous-sections Niveau 2 */}
              {item.children.map((child) => (
                <View key={child.id}>
                  <View style={styles.subsectionTitle} id={`section-${child.id}`}>
                    <Text style={styles.subsectionNumber}>{child.index}</Text>
                    <Text style={{ flex: 1 }}>{child.title}</Text>
                  </View>
                  
                  {child.description && (
                    <Text style={styles.subsectionDescription}>{child.description}</Text>
                  )}

                  {/* Éléments Niveau 3 */}
                  {child.children && child.children.length > 0 && (
                    <View style={styles.bulletList}>
                      {child.children.map((grandChild) => (
                        <View key={grandChild.id} style={styles.bulletItem}>
                          <View style={styles.bulletPoint} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bulletTitle}>{grandChild.title}</Text>
                            {grandChild.description && (
                              <Text style={styles.bulletText}>{grandChild.description}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Si pas d'enfants niveau 2, afficher directement les niveau 3 */}
              {item.children.length === 0 && getChildren(item.id).length > 0 && (
                <View style={styles.bulletList}>
                  {getChildren(item.id).map((child) => (
                    <View key={child.id} style={styles.bulletItem}>
                      <View style={styles.bulletPoint} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bulletTitle}>{child.title}</Text>
                        {child.description && (
                          <Text style={styles.bulletText}>{child.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Footer */}
          <Text style={styles.footer}>
            {specification.title} - Cahier des charges
          </Text>
          <Text style={styles.pageNumber}>
            Page 2
          </Text>
        </Page>
      )}
    </Document>
  );
};

export default SpecificationPDF;