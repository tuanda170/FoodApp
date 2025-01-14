import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { supabase } from '../../FoodOrdering7/lib/supabase';
import SearchBar from '../components/SearchBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useNavigation } from '@react-navigation/native';

type FoodItem = { // Khai báo kiểu dữ liệu cho món ăn
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
  rating: number;
  rating_sum: number;
  rating_count: number;
};

const ExploreAndFoodMenuScreen: React.FC = () => { 
  const [data, setData] = useState<FoodItem[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [thankYouModalVisible, setThankYouModalVisible] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredFood, setFilteredFood] = useState<FoodItem[]>([]);
  const [isSortedAscending, setIsSortedAscending] = useState<boolean>(true);
  const [cart, setCart] = useState<FoodItem[]>([]);
  const [cartVisible, setCartVisible] = useState<boolean>(false);

  const navigation = useNavigation();

  // Hàm lấy dữ liệu từ cơ sở dữ liệu food_items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const { data, error } = await supabase.from('food_items').select('*');
        if (error) {
          setErrorMessage(error.message);
        } else {
          setData(data);
          setFilteredFood(data);
        }
      } catch (err) {
        setErrorMessage('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm lọc món ăn theo tên
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFood(data);
    } else {
      const filtered = data.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFood(filtered);
    }
  }, [searchQuery, data]);
  
  // Hàm sắp xếp món ăn theo giá
  const sortPrice = () => {
    const sortedData = [...filteredFood].sort((a, b) =>
      isSortedAscending ? a.price - b.price : b.price - a.price
    );
    setFilteredFood(sortedData);
    setIsSortedAscending(!isSortedAscending);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedFood(null);
  };

  const closeThankYouModal = () => {
    setThankYouModalVisible(false);
  };

  // Hàm xử lý khi người dùng đánh giá món ăn
  const handleRatingClick = async (newRating: number) => {
    if (!selectedFood) return; // Nếu không có món ăn được chọn, thoát khỏi hàm
    try {
      // Lấy dữ liệu đánh giá hiện tại (rating_sum, rating_count, và rating)
      const { data: currentFood, error: fetchError } = await supabase
        .from('food_items')
        .select('rating_sum, rating_count, rating')
        .eq('id', selectedFood.id)
        .single();
      if (fetchError) {
        alert('Failed to fetch current rating. Please try again.');
        return;
      }
      const currentSum = currentFood?.rating_sum ?? 0;
      const currentCount = currentFood?.rating_count ?? 0;
      const newSum = currentSum + newRating;
      const newCount = currentCount + 1;
      const averageRating = newSum / newCount;
      const clampedRating = Math.min(Math.max(averageRating, 0), 5);
      const formattedRating = clampedRating.toFixed(1);
      
      const { error: updateError } = await supabase
        .from('food_items')
        .update({
          rating_sum: newSum,
          rating_count: newCount,
          rating: formattedRating,
        })
        .eq('id', selectedFood.id);
      if (updateError) {
        alert('Failed to update rating. Please try again.');
        return;
      }
      
      setData((prevData) =>
        prevData.map((foodItem) =>
          foodItem.id === selectedFood.id
            ? { ...foodItem, rating: parseFloat(formattedRating) }
            : foodItem
        )
      );
      setSelectedFood((prev) => prev ? { ...prev, rating: parseFloat(formattedRating) } : null);
      setThankYouModalVisible(true);
    } catch (err) {
      alert('An unexpected error occurred.');
    }
  };

 
  const addToCart = (item: FoodItem) => {
    if (item.status === 'OUT OF ORDER') {
      alert(`${item.title} is currently out of order.`);
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Hàm xóa món ăn khỏi giỏ hàng
  const removeFromCart = (itemId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((cartItem) =>
          cartItem.id === itemId
            ? cartItem.quantity > 1
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : null
            : cartItem
        )
        .filter(Boolean)
    );
  };

  // Hàm tính tổng giá tiền của giỏ hàng
  const calculateTotalPrice = () => {
    return cart
      .reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0)
      .toFixed(2);
  };

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]); //setCart là hàm để cập nhật giỏ hàng
  };

  // Hàm render món ăn
  const renderItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.status === 'OUT OF ORDER') { // Nếu trạng thái món ăn là "OUT OF ORDER" thì hiển thị "thông báo" 
          alert(`${item.title} is currently out of order.`); // alert là hiển thị thông báo "món ăn hiện đang hết hàng"
          return;
        }
        setSelectedFood(item); 
        setModalVisible(true); // setModalVisible(true) để hiển thị modal
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} /> 
      <Text style={styles.title}>{item.title ?? 'No title available'}</Text>
      <Text style={styles.price}>Price: ${item.price ?? 'N/A'}</Text>
      <Text
        style={[
          styles.status,
          { color: item.status === 'OUT OF ORDER' ? 'red' : 'green' },
        ]}
      >
        {item.status === 'OUT OF ORDER' ? 'OUT OF ORDER' : 'Available'}
      </Text>
      <TouchableOpacity 
        style={[
          styles.addToCartButton, 
          item.status === 'OUT OF ORDER' && styles.disabledButton, // Nếu món ăn hết hàng thì disabledButton
        ]}
        onPress={() => addToCart(item)}
        disabled={item.status === 'OUT OF ORDER'}
      >
        <Text style={styles.addToCartText}>
          {item.status === 'OUT OF ORDER' ? 'Unavailable' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return ( 
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ff8c00', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="restaurant-outline" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>Hôm nay bạn ăn gì ?</ThemedText>
      </ThemedView>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortPrice={sortPrice} />

      <FlatList
        data={filteredFood}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<Text style={styles.emptyText}>No data found.</Text>}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFood ? (
              <>
                <Text style={styles.modalTitle}>{selectedFood.title}</Text>
                <Image source={{ uri: selectedFood.imageUrl }} style={styles.modalImage} />
                <Text style={styles.modalDescription}>{selectedFood.description || 'No description available.'}</Text>
                <Text style={styles.price}>Price: ${selectedFood.price ?? 'N/A'}</Text>
                <Text style={styles.modalRating}>Rating: {selectedFood.rating ?? 'No rating yet'}</Text>
                <View style={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => handleRatingClick(star)}>
                      <Ionicons
                        name={star <= (selectedFood.rating ?? 0) ? "star" : "star-outline"}
                        size={20}
                        color={star <= (selectedFood.rating ?? 0) ? "#ff8c00" : "#ccc"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={thankYouModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thank you for your rating!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeThankYouModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={cartVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Giỏ hàng</Text>
              <TouchableOpacity onPress={clearCart}>
                <Ionicons name="trash-bin-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
            {cart.length === 0 ? (
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemTitle}>{item.title}</Text>
                    <Text style={styles.cartItemQuantity}>
                      {item.quantity} x ${item.price}
                    </Text>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-bin" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            )}
            <Text style={styles.total}>Tổng cộng : ${calculateTotalPrice()}</Text>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={() => {
                setCartVisible(false);
                navigation.navigate('Payment', { cartItems: cart });
              }}
            >
              <Text style={styles.proceedButtonText}>Proceed to Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setCartVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.cartIconContainer} onPress={() => setCartVisible(true)}>
        <Ionicons name="cart-outline" size={30} color="black" />
      </TouchableOpacity>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  cartButtonText: {
    fontSize: 18,
    marginLeft: 5,
    color: '#ff8c00',
  },
  headerImage: {
    color: '#FFF',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  itemContainer: {
    width: '45%',
    height: 210,
    margin: 10,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#228B22',
    marginBottom: 1,
  },
  image: {
    width: '100%',
    height: 70,
    borderRadius: 10,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  rating: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff8c00',
    marginBottom: 1,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  closeButton: {
    paddingVertical: 10,
    backgroundColor: '#C30F16',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    resizeMode: 'cover',
  },
  proceedButton: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginLeft: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: 'gray',
    borderColor: 'darkgray',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addToCartButton: {
    backgroundColor: 'orange',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalRating: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cartIconContainer: {
    position: 'absolute',
    top: 10,
    right: -5,
    padding: 25,
    zIndex: 1,
  },
});

export default ExploreAndFoodMenuScreen;