import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../FoodOrdering7/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  image_url?: string | null;
};

type Order = {
  id: number;
  created_at: string;
  total_price: number;
  phone_number: string;
  address: string;
  note?: string;
  items: string; // Stored as a JSON string in the database
};

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSortedAscending, setIsSortedAscending] = useState<boolean>(true);

  // Fetch order history
  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error fetching user:', authError.message);
        return;
      }

      if (!user) {
        console.error('No logged-in user found.');
        return;
      }

      const { data, error } = await supabase
        .from<Order>('order_history2')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching order history:', error.message);
        return;
      }
      setOrderHistory(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  // Fetch item images
  const fetchItemImages = async (items: OrderItem[]): Promise<OrderItem[]> => {
    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const { data, error } = await supabase
          .from('food_items')
          .select('imageUrl')
          .eq('title', item.title)
          .limit(1) // Fetch only the first match
          .single();
  
        if (error) {
          console.error(`Error fetching image for ${item.title}:`, error.message);
          return { ...item, image_url: null }; // Fallback if there's an error
        }
  
        return { ...item, image_url: data?.imageUrl || null };
      })
    );
    return itemDetails;
  };

  // Handle "Show More" button click
  const handleShowMore = async (order: Order) => {
    const parsedItems: OrderItem[] = order.items ? JSON.parse(order.items) : [];
    const itemsWithImages = await fetchItemImages(parsedItems);

    navigation.navigate('OrderDetails', { order: { ...order, parsedItems: itemsWithImages } });
  };

  // Sort orders by date
  const sortByDate = () => {
    const sortedData = [...orderHistory].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return isSortedAscending ? dateA - dateB : dateB - dateA;
    });
    setOrderHistory(sortedData);
    setIsSortedAscending(!isSortedAscending);
  };

  // Format date and time
  const formatDateTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return {
      formattedDate: date.toLocaleDateString(),
      formattedTime: date.toLocaleTimeString(),
    };
  };

  // Calculate total price of items in an order
  const calculateTotalPrice = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Render individual order item
  const renderOrderItem = ({ item }: { item: Order }) => {
    const { formattedDate, formattedTime } = formatDateTime(item.created_at);
    const parsedItems: OrderItem[] = item.items ? JSON.parse(item.items) : []; // Parse items from the order

    const totalPrice = calculateTotalPrice(parsedItems);

    return (
      <View style={styles.orderItem}>
        <Text style={styles.orderText}>Order ID: {item.id}</Text>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.orderText}>Date: {formattedDate}</Text>
          <Text style={styles.orderText}>Time: {formattedTime}</Text>
        </View>
        <Text style={[styles.orderText, { fontWeight: 'bold' }]}>Total Price: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => handleShowMore(item)} style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>Show More &gt;&gt;</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>--------------------</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <TouchableOpacity onPress={sortByDate} style={styles.sortButton}>
        <Text style={styles.sortButtonText}>
          Sort by Date
          <MaterialIcons
            name={isSortedAscending ? 'arrow-drop-up' : 'arrow-drop-down'}
            size={24}
            color="white"
          />
        </Text>
      </TouchableOpacity>
      {orderHistory.length > 0 ? (
        <FlatList
          data={orderHistory}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noOrders}>No orders found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  orderText: {
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  separator: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  noOrders: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    marginRight: 10,
  },
  showMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  showMoreText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;