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
    marginBottom: 50,
    paddingBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    letterSpacing: 3,
  },
  
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  
  projectDescription: {
    fontSize: 11,
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  
  documentDate: {
    fontSize: 9,
    color: '#666666',
    marginTop: 10,
  },

  // Table des matières
  tocTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 25,
    marginTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'left',
  },
  
  tocSection: {
    marginBottom: 25,
  },
  
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  
  tocItemLevel1: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 3,
  },
  
  tocItemLevel2: {
    marginLeft: 25,
    fontSize: 11,
    marginBottom: 2,
  },
  
  tocItemText: {
    flex: 1,
    marginRight: 20,
  },
  
  tocLink: {
    color: '#000000',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  
  tocLinkLevel2: {
    color: '#000000',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  
  tocDots: {
    flex: 1,
    textAlign: 'right',
    color: '#000000',
    fontSize: 10,
    marginLeft: 10,
  },

  // Contenu principal
  contentSection: {
    marginTop: 30,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 25,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  
  sectionNumber: {
    color: '#000000',
    marginRight: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 20,
  },
  
  subsectionNumber: {
    color: '#000000',
    marginRight: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  description: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 15,
    lineHeight: 1.6,
    textAlign: 'justify',
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
    marginLeft: 40,
    marginTop: 10,
    marginBottom: 15,
  },
  
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    marginRight: 12,
    marginTop: 5,
    flexShrink: 0,
  },
  
  bulletText: {
    fontSize: 11,
    color: '#000000',
    flex: 1,
    lineHeight: 1.5,
  },

  // Descriptions en ligne
  inlineDescription: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#666666',
    fontWeight: 'normal',
  },
  
  inlineDescriptionSub: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666666',
    fontWeight: 'normal',
  },
  
  inlineDescriptionBullet: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666666',
    fontWeight: 'normal',
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
                <Text style={{ flex: 1 }}>
                  {item.title}
                  {item.description && (
                    <Text style={styles.inlineDescription}> {item.description}</Text>
                  )}
                </Text>
              </View>

              {/* Sous-sections Niveau 2 */}
              {item.children.map((child) => (
                <View key={child.id}>
                  <View style={styles.subsectionTitle} id={`section-${child.id}`}>
                    <Text style={styles.subsectionNumber}>{child.index}</Text>
                    <Text style={{ flex: 1 }}>
                      {child.title}
                      {child.description && (
                        <Text style={styles.inlineDescriptionSub}> {child.description}</Text>
                      )}
                    </Text>
                  </View>

                  {/* Éléments Niveau 3 */}
                  {child.children && child.children.length > 0 && (
                    <View style={styles.bulletList}>
                      {child.children.map((grandChild) => (
                        <View key={grandChild.id} style={styles.bulletItem}>
                          <View style={styles.bulletPoint} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bulletTitle}>
                              {grandChild.title}
                              {grandChild.description && (
                                <Text style={styles.inlineDescriptionBullet}> {grandChild.description}</Text>
                              )}
                            </Text>
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
                        <Text style={styles.bulletTitle}>
                          {child.title}
                          {child.description && (
                            <Text style={styles.inlineDescriptionBullet}> {child.description}</Text>
                          )}
                        </Text>
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