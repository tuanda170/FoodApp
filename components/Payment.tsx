import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, TextInput } from 'react-native';
import { supabase } from '../../FoodOrdering7/lib/supabase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Add an icon for delivery

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

type RouteParams = {
  Payment: {
    cartItems: CartItem[];
  };
};

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState<any>(null); // State to store user data
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Payment'>>();
  const { cartItems } = route.params;

  
  // Lấy thông tin người dùng và điền vào form
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);

      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const currentUser = session?.session?.user;
        if (!currentUser) {
          Alert.alert('Error', 'No user session found.');
          return;
        }

        setUser(currentUser);

        // Lấy thông tin profile từ database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('phoneNumber, address')
          .eq('id', currentUser.id) // Assuming `id` is the foreign key to the `auth.users` table
          .single();

        if (profileError) throw profileError;

        // Tự động điền thông tin vào form nếu đã có trong database
        setPhoneNumber(profile.phoneNumber || '');
        setAddress(profile.address || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Unable to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Tính tổng giá tiền của đơn hàng trong PaymentScreen
  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Hàm xử lý khi người dùng nhấn nút Place Order
  const handleOrderSubmission = async () => {
    if (!phoneNumber || !address) {
      alert('Please enter your phone number and address.'); // Yêu cầu nhập số điện thoại và địa chỉ
      return;
    }
  
    setLoading(true);
    try {
      // Dữ liệu đơn hàng
      const orderData = {
        items: cartItems.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })), // This matches the `items` field as JSON
        total: parseFloat(calculateTotalPrice()), // Match the `total` field
        phoneNumber: phoneNumber, // Match the `phoneNumber` field
        address: address, // Match the `address` field
        user_id: user?.id, // Add user_id to the order
        note: note, // Include the note field
      };
  
      // Hàm thêm dữ liệu vào bảng order_history2
      const { error } = await supabase.from('order_history2').insert([orderData]);
  
      if (error) {
        console.error('Failed to place order:', error);
        alert('Failed to place your order. Please try again.');
      } else {
        // Hiển thị modal thông báo khi đặt hàng thành công
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigation.navigate('Home'); // Bấm OK để chuyển hướng về trang Home
  };

  return ( // return để Hiển thị thông tin đơn hàng và form nhập thông tin
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Order</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text>{item.quantity} x ${item.price}</Text>
            </View>
          </View>
        )}
      />
      <Text style={styles.total}>Tổng đơn hàng: ${calculateTotalPrice()}</Text>

      {/* Display the user's email below the total */}
      {user && <Text style={styles.email}>Email: {user.email}</Text>}

      {/* New input fields for phone number, address, and note */}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ nhà của bạn"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Ghi chú thêm ( tùy chọn )"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleOrderSubmission}
        disabled={loading}
      >
        <Text style={styles.confirmButtonText}>{loading ? 'Processing...' : 'Place Order'}</Text>
      </TouchableOpacity>

      {/* Custom Modal for Thank You message */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="truck" size={50} color="#ff8c00" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Thank You for Your Purchase!</Text>
            <Text style={styles.modalMessage}>Your order is on the way and will be delivered soon!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
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
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#ff8c00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: 350, // You can adjust the width if needed
    height: 700, // Increase the height to make the modal larger
    padding: 40, // Adjust padding to make the content fit better
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center', // Ensures the content is centered
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#ff8c00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PaymentScreen;
