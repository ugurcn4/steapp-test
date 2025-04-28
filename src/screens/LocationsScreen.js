import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LocationsScreen = () => {
  const navigation = useNavigation();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareType, setSelectedShareType] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' veya 'groups'

  // Arkadaş listesi (örnek veri)
  const [friends, setFriends] = useState([
    { 
      id: '1', 
      name: 'Ahmet Yılmaz', 
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      online: true
    },
    { 
      id: '2', 
      name: 'Ayşe Kaya', 
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      online: true
    },
    { 
      id: '3', 
      name: 'Mehmet Demir', 
      photo: 'https://randomuser.me/api/portraits/men/78.jpg',
      online: false
    },
    { 
      id: '4', 
      name: 'Zeynep Çelik', 
      photo: 'https://randomuser.me/api/portraits/women/67.jpg',
      online: true
    },
    { 
      id: '5', 
      name: 'Mustafa Yıldız', 
      photo: 'https://randomuser.me/api/portraits/men/91.jpg',
      online: false
    }
  ]);

  // Aktif konum paylaşımları (örnek veri)
  const [activeShares, setActiveShares] = useState([
    {
      id: '1',
      userId: '2',
      userName: 'Ayşe Kaya',
      userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
      type: 'live',
      startTime: new Date(Date.now() - 45 * 60000), // 45 dakika önce
      location: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: 'Taksim Meydanı, İstanbul'
      }
    },
    {
      id: '2',
      userId: '1',
      userName: 'Ahmet Yılmaz',
      userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
      type: 'instant',
      startTime: new Date(Date.now() - 10 * 60000), // 10 dakika önce
      location: {
        latitude: 41.0421,
        longitude: 29.0044,
        address: 'Kadıköy, İstanbul'
      }
    }
  ]);

  // Gruplar (örnek veri)
  const [groups, setGroups] = useState([
    {
      id: '1',
      name: 'Aile',
      members: ['1', '3', '4'],
      icon: 'people-outline'
    },
    {
      id: '2',
      name: 'İş Arkadaşları',
      members: ['2', '5'],
      icon: 'briefcase-outline'
    },
    {
      id: '3',
      name: 'Okul Grubu',
      members: ['1', '2', '3'],
      icon: 'school-outline'
    }
  ]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Konumlar',
      headerStyle: {
        backgroundColor: '#252636',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  const formatShareTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return `${hours} saat önce`;
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => setShowShareModal(false)}
    >
      <View style={styles.friendAvatarContainer}>
        <Image source={{ uri: item.photo }} style={styles.friendAvatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={styles.friendName}>{item.name}</Text>
      <TouchableOpacity 
        style={[styles.shareButton, { backgroundColor: selectedShareType === 'live' ? '#FF3B30' : '#4CAF50' }]}
        onPress={() => {
          // Konum paylaşımı işlemi buraya gelecek
          setShowShareModal(false);
        }}
      >
        <Text style={styles.shareButtonText}>
          {selectedShareType === 'live' ? 'Canlı' : 'Anlık'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }) => {
    // Grup üye sayısı
    const memberCount = item.members.length;
    
    return (
      <TouchableOpacity 
        style={styles.groupItem}
        onPress={() => {
          // Grup ile konum paylaşımı
          setShowShareModal(false);
          alert(`${item.name} grubu ile ${selectedShareType === 'live' ? 'canlı' : 'anlık'} konum paylaşılacak`);
        }}
      >
        <View style={styles.groupIconContainer}>
          <Ionicons name={item.icon} size={24} color="#FFF" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupMemberCount}>{memberCount} üye</Text>
        </View>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: selectedShareType === 'live' ? '#FF3B30' : '#4CAF50' }]}
        >
          <Text style={styles.shareButtonText}>
            {selectedShareType === 'live' ? 'Canlı' : 'Anlık'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#252636"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konumlar</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {}}
        >
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Konum Paylaşım Kartları */}
        <View style={styles.shareCardsContainer}>
          <TouchableOpacity 
            style={styles.shareCard}
            onPress={() => {
              setSelectedShareType('instant');
              setShowShareModal(true);
            }}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="share-location" size={32} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Anlık Konum</Text>
              <Text style={styles.cardDescription}>Şu anki konumunuzu paylaşın</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareCard}
            onPress={() => {
              setSelectedShareType('live');
              setShowShareModal(true);
            }}
          >
            <LinearGradient
              colors={['#FF3B30', '#B71C1C']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="location-on" size={32} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>Canlı Konum</Text>
              <Text style={styles.cardDescription}>Gerçek zamanlı takip için paylaşın</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Grup Paylaşım Seçeneği */}
        <TouchableOpacity 
          style={styles.groupShareCard}
          onPress={() => {
            // Grup seçme modalını göster
            alert('Grup paylaşımı yakında eklenecek');
          }}
        >
          <LinearGradient
            colors={['#4A62B3', '#3949AB']}
            style={styles.groupCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.groupIconWrapper}>
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="groups" size={32} color="#FFF" />
              </View>
            </View>
            <View style={styles.groupCardContent}>
              <Text style={styles.cardTitle}>Grup Paylaşımı</Text>
              <Text style={styles.cardDescription}>Birden fazla kişiyle aynı anda konum paylaşın</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Aktif Konum Paylaşımları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif Paylaşımlar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {activeShares.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="location-off" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>Aktif paylaşım bulunmuyor</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeSharesContainer}
            >
              {activeShares.map((share) => (
                <TouchableOpacity key={share.id} style={styles.activeShareCard}>
                  <View style={styles.shareUserInfo}>
                    <Image source={{ uri: share.userPhoto }} style={styles.shareUserPhoto} />
                    <View>
                      <Text style={styles.shareUserName}>{share.userName}</Text>
                      <View style={styles.shareTypeContainer}>
                        <View style={[styles.shareTypeIndicator, { 
                          backgroundColor: share.type === 'live' ? '#FF3B30' : '#4CAF50' 
                        }]} />
                        <Text style={styles.shareTypeText}>
                          {share.type === 'live' ? 'Canlı Konum' : 'Anlık Konum'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.shareLocationInfo}>
                    <View style={styles.shareLocationIcon}>
                      <MaterialIcons 
                        name={share.type === 'live' ? 'location-on' : 'share-location'} 
                        size={22} 
                        color="#FFF" 
                      />
                    </View>
                    <View style={styles.shareLocationText}>
                      <Text style={styles.shareAddress}>{share.location.address}</Text>
                      <Text style={styles.shareTime}>{formatShareTime(share.startTime)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.shareActions}>
                    <TouchableOpacity style={styles.shareAction}>
                      <MaterialIcons name="directions" size={22} color="#4A62B3" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareAction}>
                      <MaterialIcons name="close" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Harita Görünümü */}
        <TouchableOpacity 
          style={styles.mapViewButton}
          onPress={() => navigation.navigate('MapPage')}
        >
          <LinearGradient
            colors={['#4A62B3', '#3949AB']}
            style={styles.mapViewGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <FontAwesome5 name="map-marked-alt" size={24} color="#FFF" />
            <Text style={styles.mapViewText}>Harita Görünümüne Geç</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Arkadaş Seçme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showShareModal}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedShareType === 'live' ? 'Canlı Konum Paylaşımı' : 'Anlık Konum Paylaşımı'}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowShareModal(false)}
              >
                <Ionicons name="close" size={24} color="#252636" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              {selectedShareType === 'live' 
                ? 'Canlı konumunuz sürekli güncellenecek ve seçtiğiniz kişi tarafından takip edilebilecektir.'
                : 'Şu anki konumunuz tek seferlik olarak paylaşılacaktır.'}
            </Text>
            
            {/* Tab Seçiciler */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'friends' && styles.activeTab]} 
                onPress={() => setActiveTab('friends')}
              >
                <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Arkadaşlar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'groups' && styles.activeTab]} 
                onPress={() => setActiveTab('groups')}
              >
                <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Gruplar</Text>
              </TouchableOpacity>
            </View>
            
            {activeTab === 'friends' ? (
              <>
                <Text style={styles.friendsListTitle}>Paylaşılacak kişiyi seçin</Text>
                <FlatList
                  data={friends}
                  renderItem={renderFriendItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.friendsListContainer}
                />
              </>
            ) : (
              <>
                <Text style={styles.friendsListTitle}>Paylaşılacak grubu seçin</Text>
                <FlatList
                  data={groups}
                  renderItem={renderGroupItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.friendsListContainer}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#252636',
  },
  container: {
    flex: 1,
    backgroundColor: '#252636',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#363748',
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  // Paylaşım Kartları Stilleri
  shareCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  shareCard: {
    width: (width - 40) / 2,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 'auto',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'left',
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  // Grup Paylaşım Kartı
  groupShareCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  groupIconWrapper: {
    marginRight: 16,
  },
  groupCardContent: {
    flex: 1,
  },
  // Bölüm Stilleri
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A62B3',
  },
  // Boş Durum Stili
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2E42',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  // Aktif Paylaşımlar Stilleri
  activeSharesContainer: {
    paddingBottom: 8,
  },
  activeShareCard: {
    width: width * 0.85,
    backgroundColor: '#2D2E42',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareUserPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  shareUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  shareTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  shareTypeText: {
    fontSize: 13,
    color: '#B0B0B8',
  },
  shareLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#363748',
    borderRadius: 12,
    padding: 12,
  },
  shareLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A62B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareLocationText: {
    flex: 1,
  },
  shareAddress: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  shareTime: {
    fontSize: 12,
    color: '#B0B0B8',
  },
  shareActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shareAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#363748',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  // Harita Görünümü Butonu
  mapViewButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapViewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  mapViewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 12,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252636',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4A62B3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4A62B3',
    fontWeight: '600',
  },
  friendsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252636',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  friendsListContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  friendAvatarContainer: {
    position: 'relative',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
    bottom: 0,
    right: 16,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
    color: '#252636',
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  // Grup öğesi stilleri
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  groupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A62B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#252636',
    marginBottom: 4,
  },
  groupMemberCount: {
    fontSize: 13,
    color: '#666',
  },
});

export default LocationsScreen; 