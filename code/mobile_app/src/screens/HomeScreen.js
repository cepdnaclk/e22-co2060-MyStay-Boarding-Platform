import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Image, SafeAreaView, Platform } from 'react-native';
import { Search, MapPin, DollarSign, Users, Star, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      setIsLoggedIn(!!token);
      if (userData) {
        setUserRole(JSON.parse(userData).role);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      const response = await api.get('/stays');
      setStays(response.data);
    } catch (error) {
      console.error('Error fetching stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStays = stays.filter(stay => {
    const title = stay.title || stay.name || '';
    const loc = stay.address || stay.location || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           loc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderItem = ({ item }) => {
    const facilities = item.facilities ? item.facilities.split(',').map(f => f.trim()) : [];
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ListingDetail', { id: item.stay_id })}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/600x400?text=No+Image' }} 
            style={styles.image} 
          />
          <View style={[styles.badge, { backgroundColor: item.availability === 'Available' ? '#52b788' : '#5a7874' }]}>
            <Text style={styles.badgeText}>{item.availability || 'Available'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title || item.name || 'Boarding Place'}</Text>

          <View style={styles.infoRow}>
            <MapPin size={14} color="#5a7874" />
            <Text style={styles.infoText} numberOfLines={1}>{item.address || item.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <DollarSign size={14} color="#1a7a6e" />
            <Text style={styles.priceText}>Rs. {item.price}<Text style={styles.monthText}>/month</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={14} color="#5a7874" />
            <Text style={styles.infoText}>{item.roomType || 'Single'} • {item.gender || 'Any'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Star size={14} color="#facc15" fill="#facc15" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>

          {facilities.length > 0 && (
            <View style={styles.facilitiesContainer}>
              {facilities.slice(0, 3).map((f, i) => (
                <View key={i} style={styles.facilityPill}>
                  <Text style={styles.facilityText}>{f}</Text>
                </View>
              ))}
              {facilities.length > 3 && (
                <View style={styles.facilityPillOutline}>
                  <Text style={styles.facilityTextOutline}>+{facilities.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Area */}
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
          <View>
            <Text style={styles.headerSubtitle}>EXPLORE</Text>
            <Text style={styles.headerTitle}>Browse Boarding Places</Text>
            <Text style={styles.headerDescription}>Find your perfect room near University of Peradeniya</Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 }}
            onPress={() => {
              if (isLoggedIn) {
                if (userRole === 'landlord') {
                  navigation.navigate('LandlordDashboard');
                } else {
                  // For student, maybe a simple profile alert or a screen if we had one
                  // For now, logout option
                  AsyncStorage.removeItem('userToken');
                  AsyncStorage.removeItem('userData');
                  setIsLoggedIn(false);
                  setUserRole(null);
                }
              } else {
                navigation.navigate('Login');
              }
            }}
          >
            <User size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#5a7874" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by title or location..."
              placeholderTextColor="#5a7874"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* List Area */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1a7a6e" />
          </View>
        ) : (
          <FlatList
            data={filteredStays}
            keyExtractor={(item) => (item.stay_id ? item.stay_id.toString() : Math.random().toString())}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Search size={32} color="#1a7a6e" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>No listings found</Text>
                <Text style={styles.emptyText}>No listings match your search.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a7a6e', // Match header color for status bar area
  },
  container: {
    flex: 1,
    backgroundColor: '#f7fafa',
  },
  header: {
    backgroundColor: '#1a7a6e',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
  },
  headerSubtitle: {
    color: '#52b788',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 10,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    shadowColor: '#1a7a6e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(26,122,110,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0d1f1d',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26,122,110,0.05)',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#e8f5f3',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d1f1d',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#5a7874',
    marginLeft: 6,
    flex: 1,
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a7a6e',
    marginLeft: 6,
  },
  monthText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#5a7874',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d1f1d',
    marginLeft: 6,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  facilityPill: {
    backgroundColor: '#e8f5f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  facilityText: {
    color: '#1a7a6e',
    fontSize: 11,
    fontWeight: '600',
  },
  facilityPillOutline: {
    backgroundColor: '#f7fafa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(26,122,110,0.15)',
  },
  facilityTextOutline: {
    color: '#5a7874',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d1f1d',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#5a7874',
  },
});
