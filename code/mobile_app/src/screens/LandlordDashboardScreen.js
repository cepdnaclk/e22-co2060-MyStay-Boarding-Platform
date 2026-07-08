import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlusCircle, Edit, Trash2, Home, TrendingUp, Calendar, LogOut } from 'lucide-react-native';
import api from '../services/api';

export default function LandlordDashboardScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        
        // Fetch listings
        const listingsRes = await api.get('/stays');
        setListings(listingsRes.data || []);
        
        // Fetch bookings
        const bookingsRes = await api.get(`/bookings/landlord/${user.id}`);
        setBookings(bookingsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.replace('Home');
  };

  const renderListing = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle}>{item.title || item.name || 'Boarding Place'}</Text>
          <Text style={styles.listingLocation}>{item.address || item.location}</Text>
          <Text style={styles.listingPrice}>Rs. {item.price}/month</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.availability === 'Available' ? '#d8f3dc' : '#eff6f5' }]}>
          <Text style={[styles.badgeText, { color: item.availability === 'Available' ? '#1a5c30' : '#5a7874' }]}>
            {item.availability || 'Available'}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Edit size={16} color="#1a7a6e" />
          <Text style={styles.actionTextEdit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Trash2 size={16} color="#d4183d" />
          <Text style={styles.actionTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a7a6e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>DASHBOARD</Text>
          <Text style={styles.headerTitle}>Landlord Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => (item.stay_id ? item.stay_id.toString() : Math.random().toString())}
        renderItem={renderListing}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { borderColor: '#1a7a6e' }]}>
                <Home size={24} color="#1a7a6e" />
                <Text style={styles.statValue}>{listings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#52b788' }]}>
                <Calendar size={24} color="#52b788" />
                <Text style={styles.statValue}>{bookings.length}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Listings</Text>
              <TouchableOpacity style={styles.addButton}>
                <PlusCircle size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Home size={40} color="#1a7a6e" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>Click "Add" to create your first listing.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a7a6e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1a7a6e',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#52b788',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  listContainer: {
    backgroundColor: '#f7fafa',
    padding: 20,
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1f1d',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#5a7874',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  addButton: {
    backgroundColor: '#e07b39',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,122,110,0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  listingLocation: {
    fontSize: 14,
    color: '#5a7874',
    marginTop: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a7a6e',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextEdit: {
    marginLeft: 4,
    color: '#1a7a6e',
    fontSize: 14,
  },
  actionTextDelete: {
    marginLeft: 4,
    color: '#d4183d',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  emptyText: {
    fontSize: 14,
    color: '#5a7874',
    marginTop: 8,
  },
});
