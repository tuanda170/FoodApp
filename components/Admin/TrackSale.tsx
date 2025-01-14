import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ScrollView, Modal, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { supabase } from '../../lib/supabase';
import { useWindowDimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const TrackSale = () => {
  const { width, height } = useWindowDimensions();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [profilesData, setProfilesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const fetchItemImages = async (items) => {
    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const { data, error } = await supabase
          .from('food_items')
          .select('imageUrl')
          .eq('title', item.title)
          .limit(1)
          .single();
  
        if (error) {
          console.error(`Error fetching image for ${item.title}:`, error.message);
          return { ...item, image_url: null };
        }
  
        return { ...item, image_url: data?.imageUrl || null };
      })
    );
    return itemDetails;
  };

  const fetchCustomerName = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching customer name:', error.message);
      return 'Unknown';
    }

    return data.full_name;
  };

  const handleShowMore = async (order) => {
    try {
      const { data, error } = await supabase
        .from('order_history2')
        .select('*')
        .eq('id', order.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const orderData = data[0];
        const parsedItems = orderData.items ? JSON.parse(orderData.items) : [];
        const itemsWithImages = await fetchItemImages(parsedItems);
        const customerName = await fetchCustomerName(orderData.user_id);
        setSelectedOrder({ ...orderData, parsedItems: itemsWithImages });
        setCustomerName(customerName);
        setIsModalVisible(true);
      } else {
        console.error('No order data found for the selected ID.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error.message);
    }
  };

  const fetchProfilesData = async () => {
    try {
      const { data, error } = await supabase
        .from('order_history2')
        .select('*');

      if (error) throw error;

      setProfilesData(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error.message);
    }
  };

  useEffect(() => {
    fetchProfilesData();
  }, []);

  useEffect(() => {
    const selectedDay = selectedDate.toISOString().split('T')[0];
    const selectedMonth = selectedDate.toISOString().slice(0, 7);
    const selectedWeekStart = new Date(selectedDate);
    selectedWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);

    const filtered = profilesData.filter((item) =>
      item.created_at && item.created_at.startsWith(selectedDay)
    );

    setFilteredData(filtered);

    const totalOrders = filtered.length;
    setDailyTotal(totalOrders);

    const totalPrice = filtered.reduce((sum, item) => sum + (item.total || 0), 0);
    setDailyTotal(totalPrice);

    const weekFiltered = profilesData.filter((item) => {
      const createdDate = new Date(item.created_at);
      return createdDate >= selectedWeekStart && createdDate <= selectedWeekEnd;
    });

    const weekTotal = weekFiltered.reduce((sum, item) => sum + (item.total || 0), 0);
    setWeeklyTotal(weekTotal);

    const monthFiltered = profilesData.filter((item) =>
      item.created_at && item.created_at.startsWith(selectedMonth)
    );

    const monthTotal = monthFiltered.reduce((sum, item) => sum + (item.total || 0), 0);
    setMonthlyTotal(monthTotal);
  }, [selectedDate, profilesData]);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);

    const formattedDate = date.toISOString().split('T')[0];
    setMarkedDates({
      [formattedDate]: { selected: true, marked: true, selectedColor: 'blue' },
    });

    hideDatePicker();
  };

  const calculateTotalPrice = (parsedItems) => {
    if (!parsedItems || !Array.isArray(parsedItems)) {
      return 0;
    }

    return parsedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
        <Button title="Show Date Picker" onPress={showDatePicker} />

        <Text style={styles.dateText}>
          Ngày được chọn: {selectedDate.toDateString()}
        </Text>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <View style={[styles.calendarContainer, { height: Math.min(300, height * 0.4) }]}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => {
              const selectedDay = day.dateString;
              setSelectedDate(new Date(selectedDay));
              setMarkedDates({
                [selectedDay]: { selected: true, marked: true, selectedColor: 'blue' },
              });
            }}
            theme={{
              selectedDayBackgroundColor: 'blue',
              todayTextColor: 'red',
            }}
          />
        </View>

        <View style={styles.filteredDataContainer}>
          <Text style={styles.dataTitle}>Lịch sử đơn hàng</Text>
          {filteredData.length > 0 ? (
            <>
              <FlatList
                data={filteredData.slice(0, 3)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Text>Created At: {new Date(item.created_at).toLocaleString()}</Text>
                    <Text>Total: {item.total || 0}</Text>
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => handleShowMore(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.showMoreText, { color: 'blue' }]}> Xem thêm...</Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.flatList}
              />
            </>
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu nào vào ngày hôm nay.</Text>
          )}
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {selectedOrder ? (
                  <>
                    <Text style={styles.modalText}>
                      <MaterialCommunityIcons name="receipt" size={20} /> Order ID: {selectedOrder.id}
                    </Text>
                    <Text style={styles.modalText}>
                      <MaterialIcons name="person" size={20} /> Customer: {customerName}
                    </Text>
                    <Text style={styles.modalText}>
                      <MaterialIcons name="phone" size={20} /> Phone: {selectedOrder.phoneNumber}
                    </Text>
                    <Text style={styles.modalText}>
                      <MaterialIcons name="location-on" size={20} /> Address: {selectedOrder.address}
                    </Text>
                    <Text style={styles.modalText}>
                      <MaterialIcons name="note" size={20} /> Note: {selectedOrder.note || 'No additional notes'}
                    </Text>
                    <Text style={styles.modalText}>
                      <MaterialIcons name="calendar-today" size={20} /> Created At: {new Date(selectedOrder.created_at).toLocaleString()}
                    </Text>

                    {selectedOrder.parsedItems && selectedOrder.parsedItems.length > 0 ? (
                      selectedOrder.parsedItems.map((item, index) => (
                        <View key={index} style={styles.itemContainer}>
                          {item.image_url && (
                            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                          )}
                          <View style={styles.itemDetails}>
                            <Text style={styles.modalText}>Title: {item.title}</Text>
                            <Text style={styles.modalText}>Quantity: x {item.quantity}</Text>
                            <Text style={[styles.modalText, { fontWeight: 'bold' }]}>Price: ${item.price}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.modalText}>No items found for this order.</Text>
                    )}

                    <Text style={[styles.modalText, styles.totalPriceText]}>
                      <MaterialIcons name="attach-money" size={20} /> Total Price: ${calculateTotalPrice(selectedOrder.parsedItems).toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.modalText}>No order details available.</Text>
                )}
                <Button title="Close" onPress={() => setIsModalVisible(false)} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tổng thu nhập ngày hôm nay: ${dailyTotal.toFixed(2)}
          </Text>
          <Text style={styles.footerText}>
            Tuần này: ${weeklyTotal.toFixed(2)}
          </Text>
          <Text style={styles.footerText}>
            Tháng này: ${monthlyTotal.toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  calendarContainer: {
    marginVertical: 10,
  },
  filteredDataContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  flatList: {
    marginTop: 10,
  },
  showMoreButton: {
    marginTop: 5,
  },
  showMoreText: {
    color: '#0066cc',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  totalPriceText: {
    fontWeight: 'bold',
    color: 'green',
    fontSize: 18, // Increase the font size
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  itemDetails: {
    flex: 1,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

export default TrackSale;
