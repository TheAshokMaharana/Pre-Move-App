import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Alert,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import { api } from '../utils/baseurl';
import Header from '../components/Header';
import { launchCamera } from 'react-native-image-picker';
import LeadVideos from './ManagerScreens/LeadVideosScreen';
import GradientText from '../components/GradientText';
import colors from '../theme/colors';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';

export default function InventoryScreen({ route }) {
  const { id: leadId } = route.params;
  const navigation = useNavigation();

  const [customer, setCustomer] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideos, setShowVideos] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandQuotation, setExpandQuotation] = useState(false);
  // ========= customer viste ==================
  const [visitStatus, setVisitStatus] = useState(null); // null, 'completed', or 'pending'

  // ============================================
  // check visit request

  useEffect(() => {
    const fetchVisitStatus = async () => {
      if (!customer) return;

      try {
        const res = await api.get(`/customer-visit-status/${customer.id}`);
        // res.data should return the visit row or null if not exists
        if (res.data?.status === 'completed') {
          setVisitStatus('completed');
        } else {
          setVisitStatus('pending');
        }
      } catch (err) {
        console.error('❌ Error fetching visit status:', err.message);
        setVisitStatus('pending'); // default to pending if error
      }
    };

    fetchVisitStatus();
  }, [customer]);

  // check visit request

  // Fetch Customer & Inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!leadId) return;
        const [res, leadRes] = await Promise.all([
          api.get(`/customer-inventory/${leadId}`),
          api.get(`/leads/${leadId}`),
        ]);

        setCustomer(leadRes.data.leads?.[0] || null);

        let items = [];
        if (Array.isArray(res.data)) items = res.data;
        else if (res.data.success) items = res.data.data;

        // Deduplicate inventory items by id
        const unique = items.filter(
          (item, index, self) =>
            index === self.findIndex(i => i.id === item.id),
        );
        setInventory(unique);
      } catch (err) {
        console.error('❌ Error fetching inventory:', err.message);
        Alert.alert('Error', 'Failed to load customer inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId]);

  // Camera Permission
  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to record videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      Alert.alert('Permission Error', 'Unable to request camera access');
      return false;
    }
  };

  // Record Video
  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to record videos',
      );
      return;
    }
    setVideoUri(null);
    launchCamera(
      { mediaType: 'video', videoQuality: 'high', durationLimit: 60 },
      response => {
        if (response.didCancel) {
          console.log('❌ User cancelled video');
        } else if (response.errorCode) {
          console.log('❌ Camera error:', response.errorMessage);
          Alert.alert(
            'Camera Error',
            response.errorMessage || 'Failed to open camera',
          );
        } else if (response.assets?.[0]?.uri) {
          setVideoUri(response.assets[0].uri);
        }
      },
    );
  };

  // Upload Video
  const uploadVideo = async () => {
    if (!videoUri || !customer) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      name: `video_${Date.now()}.mp4`,
      type: 'video/mp4',
    });
    formData.append('lead_id', customer.id);
    formData.append('cus_number', customer.cust_mobile);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('✅ Success', 'Video uploaded successfully!');
      setVideoModal(false);
      setVideoUri(null);
      setShowVideos(true);
    } catch (err) {
      console.error('❌ Upload error:', err.response?.data || err.message);
      Alert.alert('❌ Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderQuotationSection = () => {
    // last quotation dhoondhna
    const quotes = [
      customer?.cust_quote_one,
      customer?.cust_quote_two,
      customer?.cust_quote_three,
      customer?.cust_quote_four,
      customer?.cust_quote_five,
    ];
    const lastQuoteIndex = quotes
      .map((q, i) => (q ? i : null))
      .filter(i => i !== null)
      .pop();
    const lastQuoteValue =
      lastQuoteIndex !== undefined ? quotes[lastQuoteIndex] : null;
    const lastQuoteLabel =
      lastQuoteIndex !== undefined ? `Quote ${lastQuoteIndex + 1}` : null;

    if (
      !lastQuoteValue &&
      !customer?.additional_inventory_quote &&
      !customer?.addtn_inventry_charges &&
      !customer?.dealsheet_amount &&
      !customer?.additional_charges_for_cust &&
      !customer?.ele_quotation_for_customer
    ) {
      return null; // agar quotation data hi nahi hai to section hide
    }

    return (
      <View style={styles.quotationBox}>
        <TouchableOpacity
          onPress={() => setExpandQuotation(!expandQuotation)}
          style={styles.quotationBtn}
        >
          <Text
            style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}
          >
            {expandQuotation ? 'Hide Quotation ▲' : 'Your Quotation ▼'}
          </Text>
        </TouchableOpacity>

        {expandQuotation && (
          <View style={styles.quotationDetails}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>
                Label
              </Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>
                Amount (₹)
              </Text>
            </View>

            {/* Last Quote only */}
            {lastQuoteValue && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>Qutation</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {lastQuoteValue}
                </Text>
              </View>
            )}

            {/* Other rows */}
            {customer?.additional_inventory_quote && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Additional Inventory Quote
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {customer.additional_inventory_quote}
                </Text>
              </View>
            )}

            {customer?.addtn_inventry_charges && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Additional Inventory Charges
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {customer.addtn_inventry_charges}
                </Text>
              </View>
            )}

            {customer?.dealsheet_amount && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Dealsheet Amount
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {customer.dealsheet_amount}
                </Text>
              </View>
            )}

            {customer?.additional_charges_for_cust && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Additional Charges
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {customer.additional_charges_for_cust}
                </Text>
              </View>
            )}

            {customer?.ele_quotation_for_customer && (
              <View style={styles.tableRow}>
                <Text
                  style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}
                >
                  Total Quotation
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}
                >
                  {customer.ele_quotation_for_customer}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const mapLift = value =>
    ({ 0: 'No Service Lift', 1: 'Service Lift', 2: 'Small Lift' }[value] ||
    'N/A');

  // Inventory Item
  const renderInventoryItem = ({ item }) => (
    <View style={styles.inventoryCard}>
      <Image
        source={{ uri: item.sub_category_item_image }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.sub_category_item_name}</Text>
        {item.new_item === 1 && <Text style={styles.extraTag}>Extra Item</Text>}
      </View>
      <Text style={styles.itemQty}>{item.quantity}</Text>
    </View>
  );

  // Header
  const renderHeader = () => (
    <View>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Review | {customer?.id || '---'}</Text>
        <Text style={styles.subText}>
          Date:{' '}
          {customer?.lead_date
            ? new Date(customer.lead_date).toLocaleDateString('en-GB')
            : 'N/A'}
        </Text>
      </View>

      <View style={styles.addressBox}>
        <View style={styles.addressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subText}>From</Text>
            <Text style={styles.boldText}>{customer?.moving_from}</Text>
          </View>
          <Text style={styles.arrow}>↔</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.subText}>To</Text>
            <Text style={[styles.boldText, { textAlign: 'right' }]}>
              {customer?.moving_to}
            </Text>
          </View>
        </View>
      </View>
      {renderQuotationSection()}
      <View style={styles.serviceBox}>
        <Text style={styles.boldText}>Service List</Text>
        <View style={{ marginTop: 10 }}>
          {[
            { label: 'Phone No.', value: customer?.cust_mobile },
            { label: 'Email id', value: customer?.cust_email },
            {
              label: 'Moving Date',
              value: customer?.moving_date
                ? new Date(customer.moving_date).toLocaleDateString('en-GB')
                : 'N/A',
            },
            { label: 'Home Size', value: customer?.home_type_id },
            {
              label: 'Loading Floor No',
              value: customer?.moving_from_floor_no,
            },
            {
              label: 'Unloading Floor No',
              value: customer?.moving_to_floor_no,
            },
            {
              label: 'Loading Services',
              value: mapLift(customer?.moving_from_service_lift),
            },
            {
              label: 'Unloading Services',
              value: mapLift(customer?.moving_to_service_lift),
            },
            { label: 'Moving Type', value: customer?.moving_type },
            { label: 'Distance', value: customer?.approx_dist },
          ].map((row, idx) => (
            <View
              key={idx}
              style={[
                styles.serviceRow,
                idx < 5 && { borderBottomWidth: 1 }, // 👈 condition yahan laga
              ]}
            >
              <Text style={{ flex: 1, color: '#444' }}>{row.label}</Text>
              <Text style={styles.serviceValue}>
                {row.value ? String(row.value) : 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.videoBtnWrap}>
        <TouchableOpacity
          onPress={() => setShowVideos(prev => !prev)}
          style={styles.videoBtn}
        >
          <Text style={styles.btnText}>
            {showVideos ? 'Hide Videos' : 'View Videos'}
          </Text>
        </TouchableOpacity>

        {showVideos && customer && <LeadVideos leadId={customer.id} />}

        <GradientText text="Inventory" style={styles.gradientTitle} />
      </View>
    </View>
  );

  // Footer
  const renderFooter = () => (
    <View style={styles.footer}>
      {customer.spanco === 'a' && (
        <TouchableOpacity
          style={[
            styles.footerBtn,
            {
              backgroundColor: visitStatus === 'completed' ? '#888' : '#0f9d58',
              marginRight: 8,
            },
          ]}
          onPress={() =>
            visitStatus !== 'completed' &&
            navigation.navigate('ScheduleVisit', { customer })
          }
          disabled={visitStatus === 'completed'}
        >
          <Text style={styles.btnText}>
            {visitStatus === 'completed'
              ? 'Inspection Completed'
              : 'For Visit Home'}
          </Text>
        </TouchableOpacity>
      )}
      {customer.spanco === 'a' && (
        <TouchableOpacity
          style={[
            styles.footerBtn,
            {
              backgroundColor:
                visitStatus === 'completed' ? '#888' : colors.primary,
              marginLeft: 8,
            },
          ]}
          onPress={() => visitStatus !== 'completed' && setVideoModal(true)}
          disabled={visitStatus === 'completed'}
        >
          <Text style={styles.btnText}>
            {visitStatus === 'completed' ? 'Inspection Completed' : 'Add Video'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <Header />
      <FlatList
        data={inventory}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderInventoryItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 50 }}
        nestedScrollEnabled
      />

      {/* Video Upload Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={videoModal}
        onRequestClose={() => setVideoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload Video</Text>

            <TouchableOpacity
              onPress={recordVideo}
              style={[
                styles.actionBtn,
                { backgroundColor: '#0f9d58', marginBottom: 10 },
              ]}
            >
              <Text style={styles.btnText}>Add Video 🎥</Text>
            </TouchableOpacity>

            {videoUri && (
              <Text style={{ marginVertical: 10, color: '#333' }}>
                Video selected ✅
              </Text>
            )}

            <TouchableOpacity
              onPress={uploadVideo}
              disabled={uploading || !videoUri}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: uploading || !videoUri ? 0.5 : 1,
                },
              ]}
            >
              <Text style={styles.btnText}>
                {uploading ? 'Uploading...' : 'Upload Video'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVideoModal(false)}
              style={styles.cancelBtn}
            >
              <Text style={{ textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  itemName: { fontSize: 14, fontWeight: '500', color: '#333' },
  extraTag: {
    marginTop: 4,
    backgroundColor: '#FF5252',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  itemQty: {
    width: 40,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },

  headerBox: { padding: 15, backgroundColor: '#fff' },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  subText: { color: '#666', marginTop: 5, fontSize: 12 },
  boldText: { fontWeight: 'bold', fontSize: 14 },
  arrow: { fontSize: 20, alignSelf: 'center' },
  addressBox: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceBox: {
    margin: 10,
    backgroundColor: '#ffffffff',
    borderRadius: 8,
    padding: 15,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderColor: '#eee',
  },

  serviceValue: { flex: 1, textAlign: 'right', fontWeight: 'bold' },
  videoBtnWrap: { paddingHorizontal: 10, paddingVertical: 5 },
  videoBtn: {
    backgroundColor: '#03B5A7',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
  },
  gradientTitle: { fontSize: 30, fontWeight: 'bold', textAlign: 'center' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', margin: 15 },
  footerBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },

  actionBtn: {
    padding: 12,
    borderRadius: 6,
    minWidth: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    overflow: 'hidden',
  },
  cancelBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60%',
    elevation: 2,
    overflow: 'hidden',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  quotationBox: {
    paddingHorizontal: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ffffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quotationBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  quotationDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
});
