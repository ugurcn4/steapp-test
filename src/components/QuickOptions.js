import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/QuickOptionsStyles';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest, getCurrentUserUid } from '../services/friendFunctions';
import { fetchUserGroups } from '../services/groupService';
import UserSearch from './UserSearch';

const QuickOptions = () => {
  const navigation = useNavigation();
  const [friendRequests, setFriendRequests] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  useEffect(() => {
    fetchFriendRequests();
    fetchGroups();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Arkadaşlık istekleri alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const uid = await getCurrentUserUid();
      if (!uid) return;
      
      const groups = await fetchUserGroups(uid);
      setUserGroups(groups);
    } catch (error) {
      console.error('Gruplar yüklenirken hata:', error);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      setLoading(true);
      const result = await acceptFriendRequest(friendId);
      if (result.success) {
        // İsteği listeden kaldır
        setFriendRequests(prev => prev.filter(request => request.id !== friendId));
        alert('Arkadaşlık isteği kabul edildi.');
      }
    } catch (error) {
      console.error('İstek kabul edilirken hata:', error);
      alert('İstek kabul edilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      setLoading(true);
      const result = await rejectFriendRequest(friendId);
      if (result.success) {
        // İsteği listeden kaldır
        setFriendRequests(prev => prev.filter(request => request.id !== friendId));
        alert('Arkadaşlık isteği reddedildi.');
      }
    } catch (error) {
      console.error('İstek reddedilirken hata:', error);
      alert('İstek reddedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { 
      id: 1, 
      title: 'Arkadaş Ekle', 
      icon: 'user-plus', 
      iconType: 'FontAwesome5',
      gradientColors: ['#FF416C', '#FF4B2B'],
      action: () => setSearchModalVisible(true)
    },
    { 
      id: 2, 
      title: 'Gruplar', 
      icon: 'account-group', 
      iconType: 'MaterialCommunityIcons',
      gradientColors: ['#2980B9', '#6DD5FA'],
      badge: userGroups.length > 0 ? userGroups.length.toString() : null,
      badgeColor: '#2980B9',
      borderColor: '#252636',
      action: () => navigation.navigate('GroupsList')
    },
    { 
      id: 3, 
      title: 'Etkinlikler', 
      icon: 'calendar-star', 
      iconType: 'MaterialCommunityIcons',
      gradientColors: ['#F2994A', '#F2C94C'],
      badge: '2',
      badgeColor: '#F2994A',
      borderColor: '#252636',
      action: () => navigation.navigate('AllMeetings')
    },
    { 
      id: 4, 
      title: 'Konumlar', 
      icon: 'map-marker-alt', 
      iconType: 'FontAwesome5',
      gradientColors: ['#8E2DE2', '#4A00E0'],
      badge: '3',
      badgeColor: '#8E2DE2',
      borderColor: '#252636',
      action: () => navigation.navigate('Locations')
    },
    { 
      id: 5, 
      title: 'Paylaşımlar', 
      icon: 'share-alt', 
      iconType: 'FontAwesome5',
      gradientColors: ['#11998E', '#38EF7D'],
      badge: '1',
      badgeColor: '#11998E',
      borderColor: '#252636',
      action: () => setSelectedOption('shares')
    },
    { 
      id: 6, 
      title: 'İstekler', 
      icon: 'user-friends', 
      iconType: 'FontAwesome5',
      gradientColors: ['#FF8008', '#FFC837'],
      badge: friendRequests.length > 0 ? friendRequests.length.toString() : null,
      isHighlighted: friendRequests.length > 0,
      badgeColor: '#FF3B30',
      borderColor: '#FFFFFF',
      action: () => navigation.navigate('FriendRequests')
    },
    {
      id: 7,
      title: 'Tüm Arkadaşlar',
      icon: 'users',
      iconType: 'FontAwesome5', 
      gradientColors: ['#4A62B3', '#3949AB'],
      badge: null,
      badgeColor: '#4A62B3',
      borderColor: '#252636',
      action: () => navigation.navigate('AllFriends')
    },
    {
      id: 8,
      title: 'Yakındakiler',
      icon: 'radar',
      iconType: 'MaterialCommunityIcons',
      gradientColors: ['#00B4DB', '#0083B0'],
      badge: '5',
      badgeColor: '#00B4DB',
      borderColor: '#252636',
      action: () => navigation.navigate('NearbyFriends')
    },
    {
      id: 9,
      title: 'Favoriler',
      icon: 'star',
      iconType: 'FontAwesome5',
      gradientColors: ['#FFD700', '#FFA500'],
      badge: '3',
      badgeColor: '#FFD700',
      borderColor: '#252636',
      action: () => navigation.navigate('Favorites')
    }
  ];

  const renderIcon = (option) => {
    const { iconType, icon } = option;
    const iconColor = "rgba(255, 255, 255, 0.95)";
    
    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={icon} size={28} color={iconColor} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon} size={28} color={iconColor} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={icon} size={26} color={iconColor} />;
      default:
        return <Ionicons name={icon} size={28} color={iconColor} />;
    }
  };

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={[
              styles.optionItem,
              option.isHighlighted && { transform: [{scale: 1.05}] }
            ]}
            onPress={option.action}
          >
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={option.gradientColors}
                start={{ x: 0.0, y: 0.25 }}
                end={{ x: 1.0, y: 0.75 }}
                style={styles.iconContainer}
              >
                {renderIcon(option)}
              </LinearGradient>
              
              {option.badge && (
                <View style={[
                  styles.badgeContainer,
                  { 
                    backgroundColor: option.badgeColor || '#FF3B30',
                    top: option.id === 6 ? -8 : -6,  // İstekler için özel konum ayarı
                    right: option.id === 6 ? -8 : -6,  // İstekler için özel konum ayarı
                    borderColor: option.borderColor || '#252636'
                  }
                ]}>
                  <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.optionText}>
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Arkadaşlık İstekleri Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Arkadaşlık İstekleri</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#AE63E4" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#AE63E4" style={styles.loader} />
            ) : friendRequests.length > 0 ? (
              <FlatList
                data={friendRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.requestCard}>
                    <View style={styles.userInfo}>
                      {item.profilePicture ? (
                        <Image source={{ uri: item.profilePicture }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userAvatar}>
                          <Text style={styles.avatarText}>{item.name?.charAt(0) || "?"}</Text>
                        </View>
                      )}
                      <Text style={styles.userName}>{item.name || 'İsimsiz Kullanıcı'}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleRejectRequest(item.id)}
                        disabled={loading}
                      >
                        <Ionicons name="close" size={20} color="#FF6B78" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(item.id)}
                        disabled={loading}
                      >
                        <Ionicons name="checkmark" size={20} color="#44D7B6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                style={styles.requestsList}
              />
            ) : (
              <Text style={styles.emptyText}>Bekleyen arkadaşlık isteği bulunmamaktadır.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Arkadaş Arama Modalı */}
      <UserSearch 
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        refreshData={() => {
          fetchFriendRequests();
          fetchGroups();
        }}
      />
    </View>
  );
};

export default QuickOptions; 