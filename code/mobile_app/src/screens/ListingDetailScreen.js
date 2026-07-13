import React, { useState, useEffect } from 'react';
import { Linking, View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MapPin, DollarSign, Users, CheckCircle2, ChevronLeft, Map, Phone, Mail, MessageSquare } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStayDetails();
  }, [id]);

  const fetchStayDetails = async () => {
    try {
      const response = await api.get(`/stays/${id}`);
      setStay(response.data);
    } catch (error) {
      console.error('Error fetching stay details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNow = () => {
    if (stay && stay.landlordPhone && stay.landlordPhone !== 'No phone number') {
      Linking.openURL(`tel:${stay.landlordPhone}`).catch(err => {
        console.error("Failed to open dialer:", err);
        alert("Unable to open the phone dialer.");
      });
    } else {
      alert("No phone number available for this landlord.");
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert("Please log in to send a message.");
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('Chat', { 
        receiverId: stay.landlord_id, 
        receiverName: stay.landlordName || 'Landlord' 
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a7a6e" />
      </View>
    );
  }

  if (!stay) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Stay not found</Text>
      </View>
    );
  }

  const facilities = stay.facilities ? stay.facilities.split(',').map(f => f.trim()) : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageHeader}>
          <Image 
            source={{ uri: stay.image_url || 'https://via.placeholder.com/600x400?text=No+Image' }} 
            style={styles.heroImage} 
          />
          <View style={styles.overlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.imageOverlayContent}>
            <View style={[styles.badge, { backgroundColor: stay.availability === 'Available' ? '#52b788' : '#5a7874' }]}>
              <Text style={styles.badgeText}>{stay.availability || 'Available'}</Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.content}>
          <Text style={styles.title}>{stay.title || stay.name || 'Boarding Place'}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#5a7874" />
            <Text style={styles.locationText}>{stay.address || stay.location}</Text>
          </View>

          {/* Key Details Row */}
          <View style={styles.keyDetailsRow}>
            <View style={styles.keyDetailBox}>
              <DollarSign size={20} color="#1a7a6e" />
              <Text style={styles.keyDetailLabel}>Price</Text>
              <Text style={styles.keyDetailValue}>Rs. {stay.price}<Text style={{fontSize: 12}}>/mo</Text></Text>
            </View>
            <View style={styles.keyDetailBox}>
              <Users size={20} color="#1a7a6e" />
              <Text style={styles.keyDetailLabel}>Room Type</Text>
              <Text style={styles.keyDetailValue}>{stay.roomType || 'Single'}</Text>
            </View>
            <View style={styles.keyDetailBox}>
              <CheckCircle2 size={20} color="#1a7a6e" />
              <Text style={styles.keyDetailLabel}>Gender</Text>
              <Text style={styles.keyDetailValue}>{stay.gender || 'Any'}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.description}>{stay.description || 'No description available for this listing.'}</Text>
          </View>

          {/* Facilities */}
          {facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What this place offers</Text>
              <View style={styles.facilitiesGrid}>
                {facilities.map((f, i) => (
                  <View key={i} style={styles.facilityItem}>
                    <CheckCircle2 size={16} color="#52b788" style={{ marginRight: 8 }} />
                    <Text style={styles.facilityText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Landlord */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Landlord</Text>
            <View style={styles.landlordCard}>
              <View style={styles.landlordHeader}>
                <View style={styles.landlordAvatar}>
                  <Text style={styles.landlordAvatarText}>
                    {stay.landlordName ? stay.landlordName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.landlordInfo}>
                  <Text style={styles.landlordNameText}>{stay.landlordName || 'Unknown Landlord'}</Text>
                  <Text style={styles.landlordRoleText}>Landlord</Text>
                </View>
              </View>

              <View style={styles.landlordContactDetails}>
                <View style={styles.contactRow}>
                  <Mail size={16} color="#5a7874" style={{ marginRight: 8 }} />
                  <Text style={styles.contactText}>{stay.landlordContact || 'No contact info'}</Text>
                </View>
                {stay.landlordPhone && stay.landlordPhone !== 'No phone number' && (
                  <View style={styles.contactRow}>
                    <Phone size={16} color="#1a7a6e" style={{ marginRight: 8 }} />
                    <Text style={styles.contactText}>{stay.landlordPhone}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity 
                  style={[styles.landlordCallButton, { flex: 1 }]}
                  onPress={handleCallNow}
                >
                  <Phone size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.landlordCallButtonText}>Call Now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.landlordMessageButton}
                  onPress={handleSendMessage}
                >
                  <MessageSquare size={16} color="#1a7a6e" style={{ marginRight: 8 }} />
                  <Text style={styles.landlordMessageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Location / Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPlaceholder}>
              <Map size={32} color="#5a7874" style={{ marginBottom: 8 }} />
              <Text style={styles.mapText}>Map view coming soon</Text>
              <Text style={styles.mapSubText}>{stay.address || stay.location}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>Rs. {stay.price}</Text>
          <Text style={styles.priceLabel}>month</Text>
        </View>
        <View style={styles.bottomActions}>
          {stay.landlordPhone && stay.landlordPhone !== 'No phone number' && (
            <TouchableOpacity 
              style={styles.bottomCallButton}
              onPress={handleCallNow}
            >
              <Phone size={20} color="#1a7a6e" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.bookButton, stay.availability !== 'Available' && styles.bookButtonDisabled]}
            disabled={stay.availability !== 'Available'}
            onPress={() => alert('Booking functionality coming soon!')}
          >
            <Text style={styles.bookButtonText}>
              {stay.availability === 'Available' ? 'Book Now' : 'Occupied'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#0d1f1d',
  },
  imageHeader: {
    width: width,
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayContent: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d1f1d',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 15,
    color: '#5a7874',
    marginLeft: 6,
    flex: 1,
  },
  keyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e8f5f3',
    paddingVertical: 16,
  },
  keyDetailBox: {
    alignItems: 'center',
    flex: 1,
  },
  keyDetailLabel: {
    fontSize: 12,
    color: '#5a7874',
    marginTop: 6,
    marginBottom: 4,
  },
  keyDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d1f1d',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityText: {
    fontSize: 15,
    color: '#444',
  },
  mapPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#e8f5f3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a7a6e',
  },
  mapSubText: {
    fontSize: 13,
    color: '#5a7874',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  priceLabel: {
    fontSize: 13,
    color: '#5a7874',
    textDecorationLine: 'underline',
  },
  bookButton: {
    backgroundColor: '#1a7a6e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#5a7874',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  landlordCard: {
    backgroundColor: '#f7fafa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,122,110,0.1)',
  },
  landlordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  landlordAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a7a6e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  landlordAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1f1d',
  },
  landlordRoleText: {
    fontSize: 13,
    color: '#5a7874',
    marginTop: 2,
  },
  landlordContactDetails: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#3d5a57',
  },
  landlordCallButton: {
    backgroundColor: '#1a7a6e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  landlordCallButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomCallButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1a7a6e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5f3',
  },
  landlordMessageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1a7a6e',
    backgroundColor: '#e8f5f3',
  },
  landlordMessageButtonText: {
    color: '#1a7a6e',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
