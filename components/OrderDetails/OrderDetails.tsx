import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

type OrderItem = { 
  title: string;
  quantity: number;
  price: number;
  image_url?: string | null;
};

type Order = {  
  id: number;
  created_at: string;
  total_price?: number;
  phone_number: string;
  address: string;
  note?: string;
  parsedItems: OrderItem[];
};

type OrderDetailsRouteProp = RouteProp<{ params: { order: Order } }, 'params'>;

const items = [
  { label: 'Đang xem xét', screen: 'ReviewScreen', color: '#FF6347' }, // Tomato
  { label: 'Đang chuẩn bị', screen: 'CookingScreen', color: '#4682B4' }, // SteelBlue
  { label: 'Giao hàng', screen: 'DeliveryScreen', color: '#32CD32' }, // LimeGreen
];

const OrderDetails: React.FC = () => {
  const route = useRoute<OrderDetailsRouteProp>();
  const { order } = route.params;

  // Tính tổng giá tiền của tất cả các mặt hàng
  const totalItemsPrice = order.parsedItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <HorizontalScroll />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Order ID: {order.id}</Text>
        <Text style={styles.text}>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
        <Text style={styles.text}>Time: {new Date(order.created_at).toLocaleTimeString()}</Text>
        <Text style={styles.text}>Phone Number: {order.phone_number}</Text>
        <Text style={styles.text}>Address: {order.address}</Text>
        {order.note && <Text style={styles.text}>Note: {order.note}</Text>}
        {order.total_price !== undefined && (
          <Text style={styles.text}>Total Price: ${order.total_price.toFixed(2)}</Text>
        )}
        <Text style={styles.text}>Items:</Text>
        {order.parsedItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            )}
            <Text style={styles.text}>
              {item.title} x{item.quantity} (${item.price.toFixed(2)})
            </Text>
          </View>
        ))}
        <Text style={styles.totalText}>Total Items Price: ${totalItemsPrice.toFixed(2)}</Text>
        </ScrollView>
        
    </View>
  );
};

const HorizontalScroll = () => {
  const navigation = useNavigation();

  return ( 
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Render clickable items with custom colors */}
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.item, { backgroundColor: item.color }]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 18, // Increased font size
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    borderRadius: 30, // Curved corners for a better look
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Add shadow for a more 3D effect (Android)
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemText: {
    fontSize: 18, // Increased font size
    color: '#fff', // White text color for better contrast
  },
  totalText: {
    fontSize: 20, // Increased font size
    fontWeight: 'bold',
    marginTop: 20,
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
});

export default OrderDetails;
