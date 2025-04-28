import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Oluşturduğumuz bileşenleri import edelim
import QuickOptions from '../components/QuickOptions';
import FriendGroups from '../components/FriendGroups';
import Meetings from '../components/Meetings';
import UserSearch from '../components/UserSearch';
import AnimatedHeaderTitle from '../components/AnimatedHeaderTitle';
import { getFriendRequests, getCurrentUserUid } from '../services/friendFunctions';
import { fetchPendingGroupInvitations } from '../services/groupService';
// Stil dosyasını import edelim
import styles from '../styles/FriendsPageStyles';

const FriendsPage = ({ navigation, route }) => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [meetingsRefreshKey, setMeetingsRefreshKey] = useState(0);
  const [groupInvites, setGroupInvites] = useState([]);
  const [meetingInvites, setMeetingInvites] = useState([]);
  
  // Değişen karşılama mesajları
  const welcomeMessages = [
    'Arkadaşlarım',
    'Sosyal Çevrem',
    'Buluşmalarım', 
    'Etkinliklerim',
    'Gruplarım',
    'Bağlantılarım',
    'Sosyal Ağım',
    'Arkadaş Listem'
  ];

  // Sayfa odaklandığında verileri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
      setMeetingsRefreshKey(prev => prev + 1);
      loadFriendRequests();
      loadGroupInvites();
      loadMeetingInvites();
    });

    return unsubscribe;
  }, [navigation]);

  // Arkadaşlık isteklerini yükle
  const loadFriendRequests = async () => {
    try {
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Arkadaşlık istekleri yüklenirken hata:', error);
    }
  };

  // Grup davetlerini yükle
  const loadGroupInvites = async () => {
    try {
      const uid = await getCurrentUserUid();
      if (!uid) return;
      
      const invitations = await fetchPendingGroupInvitations(uid);
      setGroupInvites(invitations);
    } catch (error) {
      console.error('Grup davetleri yüklenirken hata:', error);
    }
  };

  // Buluşma davetlerini yükle
  const loadMeetingInvites = async () => {
    try {
      const uid = await getCurrentUserUid();
      if (!uid) return;
      
      // Kullanıcının katılımcı olduğu ve durumu "pending" olan buluşmaları çek
      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('participants', 'array-contains', uid)
      );
      
      const meetingsSnapshot = await getDocs(meetingsQuery);
      const pendingMeetings = [];
      
      meetingsSnapshot.docs.forEach(meetingDoc => {
        const meetingData = meetingDoc.data();
        // Kullanıcının katılım durumu "pending" ise davet olarak kabul et
        if (meetingData.participantStatus && 
            meetingData.participantStatus[uid] === 'pending') {
          pendingMeetings.push({
            id: meetingDoc.id,
            ...meetingData
          });
        }
      });
      
      setMeetingInvites(pendingMeetings);
    } catch (error) {
      console.error('Buluşma davetleri yüklenirken hata:', error);
    }
  };

  // Eğer route.params.refresh varsa, yenileme yap
  useEffect(() => {
    if (route.params?.refresh) {
      setRefreshKey(prev => prev + 1);
      setMeetingsRefreshKey(prev => prev + 1);
      loadFriendRequests();
      loadGroupInvites();
      loadMeetingInvites();
      navigation.setParams({ refresh: null });
    }
  }, [route.params?.refresh]);

  // Çekme yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Verileri yenile
      await loadFriendRequests();
      await loadGroupInvites();
      await loadMeetingInvites();
      setRefreshKey(prev => prev + 1);
      setMeetingsRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // İlk yüklemede istekleri getir
  useEffect(() => {
    loadFriendRequests();
    loadGroupInvites();
    loadMeetingInvites();
  }, []);

  // Bekleyen istekler bölümünü render et
  const renderPendingRequestsSection = () => {
    if (friendRequests.length === 0) return null;
    
    return (
      <View style={styles.pendingRequestsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bekleyen İstekler</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('FriendRequests')}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pendingRequestsCard}
          onPress={() => navigation.navigate('FriendRequests')}
        >
          <View style={styles.pendingRequestsInfo}>
            <View style={styles.pendingRequestsIcon}>
              <Ionicons name="mail" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.pendingRequestsTitle}>
                {friendRequests.length} yeni arkadaşlık isteği
              </Text>
              <Text style={styles.pendingRequestsSubtitle}>
                Bekleyen istekleri görüntüle ve yanıtla
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9797A9" />
        </TouchableOpacity>
      </View>
    );
  };

  // Bekleyen grup davetleri bölümünü render et
  const renderPendingGroupInvitesSection = () => {
    if (groupInvites.length === 0) return null;
    
    return (
      <View style={styles.pendingRequestsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grup Davetleri</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('GroupInvitations')}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pendingRequestsCard}
          onPress={() => navigation.navigate('GroupInvitations')}
        >
          <View style={styles.pendingRequestsInfo}>
            <View style={[styles.pendingRequestsIcon, {backgroundColor: '#53B4DF'}]}>
              <Ionicons name="people" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.pendingRequestsTitle}>
                {groupInvites.length} yeni grup daveti
              </Text>
              <Text style={styles.pendingRequestsSubtitle}>
                Grup davetlerini görüntüle ve yanıtla
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9797A9" />
        </TouchableOpacity>
      </View>
    );
  };

  // Bekleyen buluşma davetleri bölümünü render et
  const renderPendingMeetingInvitesSection = () => {
    if (meetingInvites.length === 0) return null;
    
    return (
      <View style={styles.pendingRequestsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buluşma Davetleri</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('AllMeetings')}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pendingRequestsCard}
          onPress={() => navigation.navigate('AllMeetings')}
        >
          <View style={styles.pendingRequestsInfo}>
            <View style={[styles.pendingRequestsIcon, {backgroundColor: '#FFAC30'}]}>
              <Ionicons name="calendar" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.pendingRequestsTitle}>
                {meetingInvites.length} yeni buluşma daveti
              </Text>
              <Text style={styles.pendingRequestsSubtitle}>
                Buluşma davetlerini görüntüle ve yanıtla
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9797A9" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#AE63E4"
            colors={["#AE63E4"]}
            progressBackgroundColor="#232333"
          />
        }
      >
        {/* Header Bölümü */}
        <LinearGradient 
          colors={['#252636', '#292A3E']} 
          start={{x: 0, y: 0}} 
          end={{x: 0, y: 1}}
          style={styles.header}
        >
          <View>
            <AnimatedHeaderTitle messages={welcomeMessages} />
          </View>
          <View style={styles.headerActionButtons}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications" size={22} color="#AE63E4" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => setSearchModalVisible(true)}>
              <Ionicons name="search" size={22} color="#AE63E4" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Hızlı Erişim Bölümü */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Özelleştir</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickOptionsSection}>
          <QuickOptions navigation={navigation} />
        </View>
        
        {/* Bekleyen İstekler Bölümü */}
        {renderPendingRequestsSection()}
        
        {/* Bekleyen Grup Davetleri Bölümü */}
        {renderPendingGroupInvitesSection()}
        
        {/* Bekleyen Buluşma Davetleri Bölümü */}
        {renderPendingMeetingInvitesSection()}
        
        {/* Arkadaş Grupları Bölümü */}
        <View style={styles.friendGroupsSection}>
          <FriendGroups refreshKey={refreshKey} />
        </View>
        
        {/* Buluşmalar Bölümü */}
        <View style={styles.meetingsSection}>
          <Meetings navigation={navigation} refreshTrigger={meetingsRefreshKey} />
        </View>
        
        {/* Alt boşluk */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Arkadaş Arama Modalı */}
      <UserSearch 
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        refreshData={onRefresh}
      />
      
      {/* Alt Navigasyon Çubuğu */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={24} color="#9797A9" style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Ana Sayfa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="people" size={24} color="#AE63E4" style={styles.tabIcon} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Arkadaşlar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map" size={24} color="#9797A9" style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Harita</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('Events')}
        >
          <Ionicons name="calendar" size={24} color="#9797A9" style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Etkinlikler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="#9797A9" style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FriendsPage;