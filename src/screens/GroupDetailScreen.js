import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { getCurrentUserUid } from '../services/friendFunctions';
import { 
  fetchUserGroups, 
  createGroupEvent, 
  fetchGroupEvents, 
  updateEventParticipation, 
  inviteToGroup,
  leaveGroup,
  deleteGroup
} from '../services/groupService';
import CreateEventModal from '../components/CreateEventModal';
import GroupEventCard from '../components/GroupEventCard';
import AddMembersModal from '../components/AddMembersModal';
import MembersList from '../components/MembersList';

const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const loadGroupDetails = async () => {
      try {
        setLoading(true);
        
        const uid = await getCurrentUserUid();
        setCurrentUserId(uid);
        
        // Grup detaylarını getir
        const userGroups = await fetchUserGroups(uid);
        const groupDetail = userGroups.find(g => g.id === groupId);
        
        if (!groupDetail) {
          Alert.alert('Hata', 'Grup bulunamadı');
          navigation.goBack();
          return;
        }
        
        setGroup(groupDetail);
        
        // Grup etkinliklerini getir
        const groupEvents = await fetchGroupEvents(groupId, uid);
        
        // Etkinlikleri tarihe göre sırala (en yakın tarih önce)
        const sortedEvents = [...groupEvents].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
        
        setEvents(sortedEvents);
        
      } catch (error) {
        console.error('Grup detayları yüklenirken hata:', error);
        Alert.alert('Hata', 'Grup detayları yüklenirken bir sorun oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    loadGroupDetails();
  }, [groupId]);
  
  const handleCreateEvent = async (eventData) => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      
      // Yeni etkinlik oluştur
      const newEvent = await createGroupEvent(groupId, eventData, currentUserId);
      
      // Mevcut etkinlik listesini güncelle
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // Modalı kapat
      setShowCreateEventModal(false);
      
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu');
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEventResponse = async (eventId, status) => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      
      // Etkinlik katılım durumunu güncelle
      const updatedEvent = await updateEventParticipation(groupId, eventId, currentUserId, status);
      
      // Etkinlik listesini güncelle
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      
      Alert.alert(
        'Başarılı', 
        status === 'accepted' ? 'Etkinliğe katılacağınız onaylandı' : 
        status === 'declined' ? 'Etkinliğe katılmayacağınız bildirildi' : 
        'Etkinlik yanıtınız güncellendi'
      );
    } catch (error) {
      console.error('Etkinlik yanıtı güncellenirken hata:', error);
      Alert.alert('Hata', 'Etkinlik yanıtı güncellenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMember = async (userId) => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      
      // Kullanıcıyı gruba davet et
      await inviteToGroup(groupId, userId, currentUserId);
      
      Alert.alert('Başarılı', 'Kullanıcı gruba davet edildi');
      
      // Modalı kapat
      setShowAddMembersModal(false);
    } catch (error) {
      console.error('Kullanıcı davet edilirken hata:', error);
      Alert.alert('Hata', error.message || 'Kullanıcı davet edilirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeaveGroup = async () => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      
      // Gruptan çık
      await leaveGroup(groupId, currentUserId);
      
      // Onay mesajı göster
      Alert.alert('Başarılı', 'Gruptan başarıyla ayrıldınız', [
        { 
          text: 'Tamam', 
          onPress: () => {
            // Navigation geçmişini temizleyip ana sayfaya dönüş
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Arkadaşlar' } }],
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Gruptan çıkarken hata:', error);
      Alert.alert('Hata', error.message || 'Gruptan çıkarken bir sorun oluştu');
    } finally {
      setLoading(false);
      setShowLeaveConfirm(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    try {
      if (!currentUserId) return;
      
      setLoading(true);
      
      // Grubu sil
      await deleteGroup(groupId, currentUserId);
      
      // Onay mesajı göster
      Alert.alert('Başarılı', 'Grup başarıyla silindi', [
        { 
          text: 'Tamam', 
          onPress: () => {
            // Navigation geçmişini temizleyip ana sayfaya dönüş
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Arkadaşlar' } }],
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Grup silinirken hata:', error);
      Alert.alert('Hata', error.message || 'Grup silinirken bir sorun oluştu');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  if (loading || !group) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#53B4DF" />
        <Text style={styles.loadingText}>Grup bilgileri yükleniyor...</Text>
      </View>
    );
  }
  
  // Kullanıcı bu grupta admin veya oluşturucu mu?
  const isAdminOrCreator = group.isAdmin || group.isCreator;
  
  // Etkinlik durumlarını hesapla
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());
  
  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grup Detayları</Text>
        
        {isAdminOrCreator && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditGroup', { group })}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollContent}>
        {/* Grup Bilgileri */}
        <View style={styles.groupInfoCard}>
          <View style={[styles.groupIcon, { backgroundColor: group.color || '#53B4DF' }]}>
            <FontAwesome5 
              name={group.icon || 'users'} 
              size={28} 
              color="#FFFFFF" 
            />
          </View>
          
          <View style={styles.groupInfoContent}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDescription}>
              {group.description || 'Bu grup için açıklama bulunmuyor.'}
            </Text>
            
            <View style={styles.groupMetaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={18} color="#9797A9" />
                <Text style={styles.metaText}>{group.members?.length || 0} Üye</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={18} color="#9797A9" />
                <Text style={styles.metaText}>{events.length} Etkinlik</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={18} color="#9797A9" />
                <Text style={styles.metaText}>
                  {formatDate(group.createdAt).split(' ').slice(0, 3).join(' ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Grup İşlemleri */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCreateEventModal(true)}
          >
            <Ionicons name="calendar" size={22} color="#53B4DF" />
            <Text style={styles.actionText}>Etkinlik Oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAddMembersModal(true)}
          >
            <Ionicons name="person-add" size={22} color="#53B4DF" />
            <Text style={styles.actionText}>Üye Davet Et</Text>
          </TouchableOpacity>
          
          {isAdminOrCreator ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Ionicons name="trash" size={22} color="#FF4136" />
              <Text style={[styles.actionText, styles.dangerText]}>Grubu Sil</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => setShowLeaveConfirm(true)}
            >
              <Ionicons name="exit" size={22} color="#FF4136" />
              <Text style={[styles.actionText, styles.dangerText]}>Gruptan Ayrıl</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Grup Üyeleri */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Grup Üyeleri</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('GroupMembers', { group })}
            >
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <MembersList 
            members={group.membersData?.slice(0, 5) || []} 
            currentUserId={currentUserId}
            isAdmin={isAdminOrCreator}
            maxDisplay={5}
            totalCount={group.members?.length || 0}
            onPressMore={() => navigation.navigate('GroupMembers', { group })}
          />
        </View>
        
        {/* Grup Etkinlikleri */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
            {upcomingEvents.length > 0 && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('GroupEvents', { groupId, events: upcomingEvents })}
              >
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 3).map(event => (
              <GroupEventCard 
                key={event.id}
                event={event}
                onRespond={handleEventResponse}
                currentUserId={currentUserId}
                isAdmin={isAdminOrCreator}
                onPress={() => navigation.navigate('EventDetail', { 
                  groupId, 
                  eventId: event.id,
                  isAdmin: isAdminOrCreator 
                })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#9797A9" />
              <Text style={styles.emptyStateText}>Yaklaşan etkinlik yok</Text>
              <Text style={styles.emptyStateSubText}>
                Yeni bir etkinlik oluşturmak için "Etkinlik Oluştur" butonuna tıklayın
              </Text>
            </View>
          )}
        </View>
        
        {/* Geçmiş Etkinlikler */}
        {pastEvents.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Geçmiş Etkinlikler</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('GroupEvents', { groupId, events: pastEvents, isPast: true })}
              >
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            
            {pastEvents.slice(0, 2).map(event => (
              <GroupEventCard 
                key={event.id}
                event={event}
                isPast={true}
                currentUserId={currentUserId}
                isAdmin={isAdminOrCreator}
                onPress={() => navigation.navigate('EventDetail', { 
                  groupId, 
                  eventId: event.id,
                  isAdmin: isAdminOrCreator,
                  isPast: true 
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Etkinlik Oluşturma Modalı */}
      <CreateEventModal 
        visible={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onCreate={handleCreateEvent}
        groupId={groupId}
      />
      
      {/* Üye Ekleme Modalı */}
      <AddMembersModal 
        visible={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        onAddMember={handleAddMember}
        currentGroupMembers={group.members || []}
      />
      
      {/* Gruptan Ayrılma Onay Modalı */}
      <Modal
        visible={showLeaveConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLeaveConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <MaterialIcons name="exit-to-app" size={48} color="#FF4136" />
            <Text style={styles.confirmTitle}>Gruptan Ayrıl</Text>
            <Text style={styles.confirmText}>
              "{group.name}" grubundan ayrılmak istediğinizden emin misiniz?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLeaveConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleLeaveGroup}
              >
                <Text style={styles.confirmButtonText}>Ayrıl</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Grup Silme Onay Modalı */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <MaterialIcons name="delete-forever" size={48} color="#FF4136" />
            <Text style={styles.confirmTitle}>Grubu Sil</Text>
            <Text style={styles.confirmText}>
              "{group.name}" grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm etkinlikler ve üyelikler silinecektir.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleDeleteGroup}
              >
                <Text style={styles.confirmButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Yükleniyor Göstergesi */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252636',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#32323E',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  groupInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#32323E',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  groupIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfoContent: {
    flex: 1,
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupDescription: {
    color: '#CDCDCD',
    fontSize: 14,
    marginBottom: 8,
  },
  groupMetaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 8,
  },
  metaText: {
    color: '#9797A9',
    fontSize: 13,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#32323E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '30%',
  },
  actionText: {
    color: '#FFFFFF',
    marginTop: 4,
    fontSize: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FF4136',
    backgroundColor: 'transparent',
  },
  dangerText: {
    color: '#FF4136',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#53B4DF',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#32323E',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubText: {
    color: '#9797A9',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252636',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#32323E',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  confirmTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmText: {
    color: '#CDCDCD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#454555',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF4136',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default GroupDetailScreen; 